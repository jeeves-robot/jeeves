var video = document.getElementById('camera');
QCodeDecoder().decodeFromCamera(video, function(er,res){
  console.log(res);                     
  // TODO   
});

