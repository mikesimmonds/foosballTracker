export function takeSnapshot(videoElement, imgParentEl: HTMLElement) {
  var canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 500;
  var ctx = canvas.getContext('2d');
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
//convert to desired file format
  var dataURI = canvas.toDataURL('image/jpeg'); // can also use 'image/png'
  var snapshot = document.createElement('img')
  snapshot.src = dataURI;
  snapshot.style.transform = 'scale(0.5)';
  imgParentEl.appendChild(snapshot);
}