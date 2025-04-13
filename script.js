let map;
let currentUser = "";
let currentLat = 0, currentLng = 0;
let selectedBase64 = "";

function saveUsername() {
    const input = document.getElementById("usernameInput");
    if (input.value.trim()) {
      currentUser = input.value.trim();
      document.getElementById("usernamePrompt").style.display = "none";
      document.getElementById("cameraWrapper").style.display = "block"; // ✅ Show button now
      initMap(); // Initialize map after username is set
    }
  }


  function compressImage(base64Str, quality = 0.6, callback) {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const maxWidth = 800; // Resize target
      const scaleSize = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * scaleSize;
  
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
      const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
      callback(compressedDataUrl);
    };
  }
  
window.initMap = function () {
  navigator.geolocation.getCurrentPosition(pos => {
    currentLat = pos.coords.latitude;
    currentLng = pos.coords.longitude;
    map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: currentLat, lng: currentLng },
      zoom: 13
    });
    loadExistingPhotos();
  });

  document.getElementById("cameraButton").addEventListener("click", () => {
    document.getElementById("cameraInput").click();
  });

  document.getElementById("cameraInput").addEventListener("change", e => {
    document.getElementById("photoModal").style.display = "flex";
document.getElementById("cameraWrapper").style.display = "none"; // ✅ Hide camera button

    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        compressImage(reader.result, 0.5, (compressedBase64) => {
          selectedBase64 = compressedBase64;
          document.getElementById("photoPreview").src = compressedBase64;
          document.getElementById("photoModal").style.display = "flex";
          document.getElementById("cameraWrapper").style.display = "none";
        });
      };      
    reader.readAsDataURL(file);
  });
}

function uploadPhoto() {
    document.getElementById("photoModal").style.display = "none";
document.getElementById("cameraWrapper").style.display = "block"; // ✅ Show again

  const desc = document.getElementById("photoDescription").value;
  if (!selectedBase64 || !currentUser) return;

  db.collection("photos").add({
    user: currentUser,
    description: desc,
    lat: currentLat,
    lng: currentLng,
    base64: selectedBase64,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    document.getElementById("photoModal").style.display = "none";
    document.getElementById("photoDescription").value = "";
    alert("Photo uploaded!");
    loadExistingPhotos();
  });
}

function cancelUpload() {
    document.getElementById("photoModal").style.display = "none";
document.getElementById("cameraWrapper").style.display = "block"; // ✅ Show again

  document.getElementById("photoModal").style.display = "none";
}

function loadExistingPhotos() {
  db.collection("photos").orderBy("timestamp", "desc").get().then(snapshot => {
    snapshot.forEach(doc => {
      const data = doc.data();
      const marker = new google.maps.Marker({
        position: { lat: data.lat, lng: data.lng },
        map: map,
        title: `${data.user}: ${data.description}`
      });

      const info = new google.maps.InfoWindow({
        content: `
          <strong>${data.user}</strong><br>
          ${data.description}<br>
          <img src="${data.base64}" width="200">
        `
      });

      marker.addListener("click", () => {
        info.open(map, marker);
      });
    });
  });
}
