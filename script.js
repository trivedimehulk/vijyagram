let map;
let currentUser = "";
let currentLat = 0, currentLng = 0;
let selectedFile;

function saveUsername() {
  const input = document.getElementById("usernameInput");
  if (input.value.trim()) {
    currentUser = input.value.trim();
    document.getElementById("usernamePrompt").style.display = "none";
    initMap(); // Initialize map after username is set
  }
}

function initMap() {
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
    const file = e.target.files[0];
    if (!file) return;
    selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      document.getElementById("photoPreview").src = reader.result;
      document.getElementById("photoModal").style.display = "flex";
    };
    reader.readAsDataURL(file);
  });
}

function uploadPhoto() {
  const desc = document.getElementById("photoDescription").value;
  if (!selectedFile || !currentUser) return;

  const photoRef = storage.ref().child("photos/" + Date.now() + "-" + selectedFile.name);
  photoRef.put(selectedFile).then(snapshot => {
    return snapshot.ref.getDownloadURL();
  }).then(url => {
    return db.collection("photos").add({
      user: currentUser,
      description: desc,
      lat: currentLat,
      lng: currentLng,
      photoUrl: url,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
  }).then(() => {
    document.getElementById("photoModal").style.display = "none";
    document.getElementById("photoDescription").value = "";
    alert("Photo uploaded!");
    loadExistingPhotos();
  });
}

function cancelUpload() {
  document.getElementById("photoModal").style.display = "none";
}

function loadExistingPhotos() {
  db.collection("photos").get().then(snapshot => {
    snapshot.forEach(doc => {
      const data = doc.data();
      const marker = new google.maps.Marker({
        position: { lat: data.lat, lng: data.lng },
        map: map,
        title: `${data.user}: ${data.description}`
      });

      const info = new google.maps.InfoWindow({
        content: `<p><strong>${data.user}</strong></p><p>${data.description}</p><img src="${data.photoUrl}" width="200">`
      });

      marker.addListener("click", () => {
        info.open(map, marker);
      });
    });
  });
}
