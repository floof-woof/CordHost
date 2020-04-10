$(document).ready(function(){
  let urlString = window.location.href;
  let url = new URL(urlString);
  let c = url.searchParams.get("user");
  console.log(c);
  document.title = c + "'s Profile"
  $.get('http://localhost:3000/API/posts/'+c,function(data,status){
    console.log('Data: ',data,' , Status: ',status);
    if(data.length === 0 || data === 'false'){
      document.getElementById('posts').innerHTML += "<p>This user has not made any posts!</p>";
      return;
    } else {
      let x = 0
      while(x <= data.length-1){
        console.log(data[x]);
        let html = '<div style="background-color:black;color:white;padding:20px;">'+'<h2>'+data[x].title + '</h2>'+'<p>'+data[x].body+'</p>' + '<h3>This was written by '+data[x].author+' at '+ data[x].creation + '</h3>'
        document.getElementById('posts').innerHTML += html;
        x++
      }
    }
  })
})
