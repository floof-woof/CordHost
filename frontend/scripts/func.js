$(document).ready(function(){
  $.get('http://localhost:3000/API/posts/fetch',function(data,status){
    console.log('Data: ',data,' , Status: ',status);
    if(data.length <= 0){
      let quotes = ['Nothing to see here!','Your posts do not exist','Your posts have entered the fifth dimension','Your posts are in another dimension!'];
      let random = Math.floor(Math.random()*quotes.length);
      document.getElementById('posts').innerHTML = quotes[random];
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
