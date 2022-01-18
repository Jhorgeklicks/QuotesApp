// show the quotes form
const createPost = document.querySelector("#page-header .showform");
function displayQuoteForm(){
    const show = document.querySelector("#modalContainer");
    show.classList.add('show');
    show.classList.remove('hide');

    const showQuoteForm = document.querySelector('.quoteBox');
    
    showQuoteForm.classList.remove('hide');
    showQuoteForm.classList.add('show');
    
}

createPost.addEventListener('click', displayQuoteForm);


// show the login form
const createLogin = document.querySelector("#page-header .action button.login");
function displayLoginForm(){
    const show = document.querySelector("#modalContainer");
    show.classList.add('show');
    show.classList.remove('hide');

    const showLoginForm = document.querySelector('.logBox');
    
    showLoginForm.classList.remove('hide');
    showLoginForm.classList.add('show');
    
}

createLogin.addEventListener('click', displayLoginForm);

// show the registration form
const regBtn = document.querySelector(".regBtn");
function displayRegistrationForm(){
//    hides the login form
    const showLoginForm = document.querySelector('.logBox');
    showLoginForm.classList.remove('show');
    showLoginForm.classList.add('hide');

// displays the registration form
    const showRegForm = document.querySelector('.RegBox');
    showRegForm.classList.remove('hide');
    showRegForm.classList.add('show');


    
}

regBtn.addEventListener('click', displayRegistrationForm);



//  close the modal
var closeModal = document.querySelector("#modalContainer .closemodal");

function closeDialog(event){
const show      = document.querySelector("#modalContainer");
const regForm   = document.querySelector(".registerForm");
const logForm   = document.querySelector(".userLogin");
const quoteForm = document.querySelector(".addPostForm");

const RegBox = document.querySelector(".RegBox");
const logBox = document.querySelector(".logBox");
const quoteBox = document.querySelector(".quoteBox");

show.classList.remove('show');
show.classList.add('hide');

RegBox.classList.remove('show');
RegBox.classList.add('hide');

logBox.classList.remove('show');
logBox.classList.add('hide');

quoteBox.classList.remove('show');
quoteBox.classList.add('hide');

regForm.reset();
logForm.reset();
quoteForm.reset();
}

closeModal.addEventListener('click', closeDialog);

function getFirstLetterInNames(word){
    const stword = word.toUpperCase();
    const splitwords = stword.split(' ');
  
    var shortname = '';
  
    if(splitwords.length > 1){
      const first = splitwords[0].split('');
      const f1 = first[0];
  
      const second = splitwords[1].split('');
      const s1= second[0];
  
      shortname += `${f1}${s1}`;
    }else{
      const first = splitwords[0].split('');
      const f1 = first[0];
  
      shortname += f1;
    }
    return shortname;
  }
  

  // function validateFile(ext) 
  // {
  //     var allowedExtension = ['jpeg', 'jpg','png'];
  //     var fileExtension = ext;
  //     var isValidFile = true;


      
  //     return isValidFile;
  // }

  function getFileExt(file){
    const getfile = file;
    const splitfile = getfile.split('.');
    const getlastIndex = splitfile.length - 1;
    const ext = splitfile[getlastIndex];
   
    return '.'+ ext;
  }


// copy quote, show and hide tool tip
const copy = document.getElementById('copy');

copy.addEventListener('click', (event)=> {
   const post = event.target.parentElement.parentElement.firstElementChild;
   post.select();
   const copiedText = navigator.clipboard.writeText(post.value);

      if(copiedText){
         const tooptip = `<span class="tooltip">Post Copied</span>`;
         document.querySelector("#page-main .mainQuotes_left .copyAndTip").insertAdjacentHTML('beforeend',tooptip);

         setTimeout(function(){
           const rmtip = document.querySelector("#page-main .mainQuotes_left .copyAndTip");
           const rmtipchild = rmtip.firstElementChild.nextElementSibling;
           rmtip.removeChild(rmtipchild);
         },3000);
      }
});

const nth = function(d) {
  if (d > 3 && d < 21) return 'th';
  switch (d % 10) {
    case 1:  return "st";
    case 2:  return "nd";
    case 3:  return "rd";
    default: return "th";
  }
}

function addCurrentDate(){
  const month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];;

  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

  const d = new Date();
  // let day = days[d.getDay()];
  let Year = d.getFullYear();
  let M = month[d.getMonth()];
  let date = d.getDate()


  return (`${date}${nth(date)} ${M}, ${Year}`);
  // 2nd May, 2020
}