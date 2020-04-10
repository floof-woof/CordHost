$(document).ready(function(){
  let urlString = window.location.href;
  let url = new URL(urlString);
  let c = url.searchParams.get("search");
  let username;
  let friends = [];
  let check = false;
  $.get('http://localhost:3000/API/fetchname',function(data,status){
    console.log('Data: ',data,' , Status: ',status);
    if(data.length <= 0){
      console.log('Could not find session name');
    } else {
      username = data;
    }
  })
  $.get('http://localhost:3000/API/fetchlist',function(data,status){
    console.log('Data: ',data,' , Status: ',status);
    if(data.length <= 0){
      console.log('Could not find session name');
    } else {
      friends = data;
    }
  })
  $.get('http://localhost:3000/API/search/'+c,function(data,status){
    if(data.length <= 0){
      document.getElementById('valid-users').innerHTML = "<h2>This user doesn't exist!</h2>";
    } else {
      for(let i = 0; i <= data.length-1; ++i){
        // || findFriend(data[i].name)
        console.log(data);
        console.log(friends);
        for(let p = 0; p <= friends.length-1; p++){
          if(friends[p].friends[0].name === data[i].name){
            check = true;
            console.log(check);
          }
        }
        if(data[i].name !== username){
          console.log(check);
          if(check === true){
            let qString = "<a href=" + "/view-profile/?user="+data[i].name+">";

            document.getElementById('valid-users').innerHTML += qString + data[i].name + "<br>"+"<br>";
          } else {
            let qString = "<a href=" + "/view-profile/?user="+data[i].name+">";

            document.getElementById('valid-users').innerHTML += qString + data[i].name + "<a href=" + 'http://localhost:3000/API/friends/add/' + data[i].name + '\n' + '>' + "Add "+c+" as a friend!"+"</a>"+"<br>"+"<br>";
          }
        } else {
          let qString = "<a href=" + "/view-profile/?user="+data[i].name+">";
          document.getElementById('valid-users').innerHTML += qString + data[i].name+"<br>"+"<br>";
        }
      };
    };
  });
});
