let renderedMarkers = new Set();
let map;
let currentUser = "";
let currentLat = 0, currentLng = 0;
let selectedBase64 = "";

function openDirections(lat, lng) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  }

  
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

    // 🟢 On initial load
google.maps.event.addListenerOnce(map, 'idle', () => {
    loadPhotosInBounds(map.getBounds());
    //loadAllPhotosUnfiltered();
  });
  
  // 🔄 On map move or zoom
  google.maps.event.addListener(map, 'dragend', () => {
    loadPhotosInBounds(map.getBounds());
  });
  
  google.maps.event.addListener(map, 'zoom_changed', () => {
    loadPhotosInBounds(map.getBounds());
  });

    
  });

  
  document.getElementById("cameraButton").addEventListener("click", () => {
    alert("📸 Capture button clicked");
    const input = document.getElementById("cameraInput");
    
    alert('resetting for ios')
    // Force-reset input so iOS Safari re-triggers 'change' reliably
  const newInput = input.cloneNode();
  input.replaceWith(newInput);
  newInput.id = "cameraInput"; // re-assign the ID

  // Attach the change listener again
  newInput.addEventListener("change", onCameraInputChange);
  
  alert('trying to auto click - propogate -> oncaminputchange fn')
  newInput.click();
    
  });
  
  async function onCameraInputChange(e) {
    alert("📂 File selected");
  
    const file = e.target.files[0];
    if (!file) {
      alert("⚠️ No file found in input");
      return;
    }
  
    try {
      alert("🔄 Reading file as base64...");
      const base64 = await readFileAsDataURL(file);
      alert("✅ File read complete. Compressing...");
  
      compressImage(base64, 0.5, (compressedBase64) => {
        alert("✅ Compression done. Showing modal...");
  
        selectedBase64 = compressedBase64;
  
        document.getElementById("photoPreview").src = compressedBase64;
        document.getElementById("photoModal").style.display = "flex";
        document.getElementById("cameraWrapper").style.display = "none";
      });
  
    } catch (err) {
      alert("❌ File read failed: " + err.message);
    }
  }

  
  document.getElementById("cameraInput").addEventListener("change", async (e) => {
    alert("📂 File selected");
  
    const file = e.target.files[0];
    if (!file) {
      alert("⚠️ No file found in input");
      return;
    }
  
    try {
      alert("🔄 Reading file as base64...");
      const base64 = await readFileAsDataURL(file);
      alert("✅ File read complete. Compressing...");
  
      compressImage(base64, 0.5, (compressedBase64) => {
        alert("✅ Compression done. Showing modal...");
  
        selectedBase64 = compressedBase64;
  
        document.getElementById("photoPreview").src = compressedBase64;
        document.getElementById("photoModal").style.display = "flex";
        document.getElementById("cameraWrapper").style.display = "none";
      });
  
    } catch (err) {
      alert("❌ File read failed: " + err.message);
      console.error("File reading failed:", err);
    }
  });
  
  // Helper to convert file to base64 string
  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        alert("📄 Reader loaded the image");
        resolve(reader.result);
      };
      reader.onerror = (err) => {
        alert("❌ Reader error");
        reject(err);
      };
      reader.readAsDataURL(file);
    });
  }
  
  

  /*
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
  }); */
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
function loadAllPhotosUnfiltered() {
    console.log("🚀 Fetching all photos from Firestore...");
  
    db.collection("photos").get().then(snapshot => {
      console.log(`📸 Found ${snapshot.size} documents`);
  
      snapshot.forEach(doc => {
        const data = doc.data();
        console.log("🔍 Document data:", data);
  
        if (!data.lat || !data.lng) {
          console.warn("❌ Skipping - missing lat/lng");
          return;
        }
  
        const markerKey = `${data.lat.toFixed(5)}|${data.lng.toFixed(5)}`;
        if (renderedMarkers.has(markerKey)) {
          console.log("⏭️ Skipping duplicate marker", markerKey);
          return;
        }
  
        renderedMarkers.add(markerKey);
  
        const marker = new google.maps.Marker({
          position: { lat: data.lat, lng: data.lng },
          map: map,
          title: `${data.user}: ${data.description}`
        });
  
        const info = new google.maps.InfoWindow({
            content: `
              <div style="max-width:250px;">
                <strong>${data.user}</strong><br>
                ${data.description}<br>
                <img src="${data.base64}" width="100%" style="margin:8px 0;"><br>
                <button onclick="openDirections(${data.lat}, ${data.lng})"
                        style="background:#1976d2;color:white;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;">
                  🧭
                </button>
              </div>
            `
          });
          
  
        marker.addListener("click", () => info.open(map, marker));
  
        console.log("✅ Marker added:", markerKey);
      });
    }).catch(err => {
      console.error("❌ Firestore error:", err);
    });
  }
  
function loadAllPhotosUnfiltered1() {
    db.collection("photos").get().then(snapshot => {
      snapshot.forEach(doc => {
        const data = doc.data();
        if (!data.lat || !data.lng) return;
  
        const markerKey = `${data.lat.toFixed(5)}|${data.lng.toFixed(5)}`;
        if (renderedMarkers.has(markerKey)) return;
  
        renderedMarkers.add(markerKey);
  
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
  
        marker.addListener("click", () => info.open(map, marker));
      });
      console.log("✅ Markers loaded:", renderedMarkers.size);
    });
  }

  
  function loadPhotosInBounds(bounds) {
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
  
    db.collection("photos")
      .where("lat", ">=", sw.lat())
      .where("lat", "<=", ne.lat())
      .get()
      .then(snapshot => {
        console.log(`🧭 Checking bounds: NE (${ne.lat()}, ${ne.lng()}) | SW (${sw.lat()}, ${sw.lng()})`);
        console.log(`📸 Found ${snapshot.size} potential matches`);
  
        snapshot.forEach(doc => {
          const data = doc.data();
          if (!data.lat || !data.lng) return;
  
          // Check if lng is in bounds too
          if (
            data.lng < Math.min(sw.lng(), ne.lng()) ||
            data.lng > Math.max(sw.lng(), ne.lng())
          ) return;
  
          const markerKey = `${data.lat.toFixed(5)}|${data.lng.toFixed(5)}`;
          if (renderedMarkers.has(markerKey)) return;
  
          renderedMarkers.add(markerKey);
  
          const marker = new google.maps.Marker({
            position: { lat: data.lat, lng: data.lng },
            map: map,
            title: `${data.user}: ${data.description}`
          });
  
          const info = new google.maps.InfoWindow({
            content: `
              <div style="max-width:250px;">
                <strong>${data.user}</strong><br>
                ${data.description}<br>
                <img src="${data.base64}" width="100%" style="margin:8px 0;"><br>
                <button onclick="openDirections(${data.lat}, ${data.lng})"
                        style="background:#1976d2;color:white;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;">
                  🧭
                </button>
              </div>
            `
          });
          
  
          marker.addListener("click", () => info.open(map, marker));
  
          console.log("✅ Marker added:", markerKey);
        });
      })
      .catch(err => console.error("🔥 Firestore query error:", err));
  }
  
  
  
  
  