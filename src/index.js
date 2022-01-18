import {initializeApp} from 'firebase/app';

import {getFirestore, collection, serverTimestamp, doc, addDoc,getDocs, deleteDoc,onSnapshot, query, orderBy, where} from 'firebase/firestore';

import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword,updateProfile, signOut} from 'firebase/auth';

import {getDatabase, ref as dbref, set , update, onValue, get, child} from "firebase/database";

import { getStorage, ref as sto_ref, uploadBytesResumable ,getDownloadURL  } from "firebase/storage";

  const firebaseConfig = {
    apiKey: "AIzaSyCS31-ZSeEWPvqFgyJ3SCV2yNnukcQ_4mM",
    authDomain: "postworld-5b1bb.firebaseapp.com",
    projectId: "postworld-5b1bb",
    storageBucket: "postworld-5b1bb.appspot.com",
    messagingSenderId: "19393159446",
    appId: "1:19393159446:web:90338a1f9ed1ed7b883037"
  };

  // -----------------------------------  References --------------------------//
  // grabs the loader box
  const loaderBox = document.querySelector(".loaderBox"); 
  // grabs the registration form
  const regUserForm = document.querySelector('.registerForm');
  // grabs the login form
  const logInForm = document.querySelector('.userLogin');
  // grabs the profile image box on the header
  const profilepicBox = document.querySelector('.imgBox');
  // grabs the logout button
  const signout = document.querySelector('.logout');
  // grabs the quote form
  const addPostForm = document.querySelector('.addPostForm');
  // grabs the select tag on the filter menu
  const categorySearch = document.querySelector('.set_category');
  // grabs the circle loader box
  const cirlceLoader = document.querySelector('.loadDull');


  // global variabl declaration
  var posts = [];
  var authors = [];
  var likes = [];

//   initializing firebase app
  initializeApp(firebaseConfig);

  // initializing firebase services
  const dbstore = getFirestore();
  const dbauth = getAuth();
  const dbbase = getDatabase();
  const dbstorage = getStorage();

  // create collection reference
  const collectionRef = collection(dbstore, 'allposts');

// grabs error and output in user space
var OutputErrorToUsers = function(err){
  let response = '';
  const EmailInUse = 'Failed!!. Email provided already Exist. Use a unique email';
  const InvalidEmail = 'The provided value for the email user property is invalid. It must be a string email address.';
  const PasswordErr = 'Email and Password provided do not match.';
  const TimeOut = 'Failed, Check your internet Connection and Try again.';
  const weakPassWord = 'Password should be at least 6 characters. use strong password';
  const UserNotFound = 'User Account Does Not Exist. Create Account Now !!';
  const defError = 'An error Occured, Try Again Later';

    switch (err) {
      case 'auth/user-not-found': 
        console.log(UserNotFound);
        response = UserNotFound;
        break;
      case 'auth/email-already-exists': 
        console.log(EmailInUse);
        response = EmailInUse;
        break;
      case 'auth/email-already-in-use':
        console.log(EmailInUse);
        response = EmailInUse;
        break;
      case 'auth/invalid-email':
        console.log(InvalidEmail);
        response = InvalidEmail;
        break;
      case 'auth/wrong-password':
        console.log(PasswordErr);
        response = PasswordErr;
        break;
      case 'auth/weak-password':
        console.log(weakPassWord);
        response = weakPassWord;
        break;
      case 'auth/timeout':
        console.log(TimeOut);
        response = TimeOut;
        break;
      default :
      console.log(defError);
      response = defError;
      break;
    }
    return response;
}

// Update Current User's display Name
  function updateDisplayName(newuser , pic = ""){
      updateProfile(dbauth.currentUser, {displayName: newuser, photoURL:pic})
        .then(() => {
        // Profile updated!
        console.log('name updated')
      }).catch((error) => {
        // An error occurred
       alert(error.code);
      });
  }

  // grab all authors
function grabAllAUthors(){
  const db_Ref = dbref(dbbase);
  const all_auth = [];
  get(child(db_Ref,'users'))
  .then( (snapshot)=>{
    snapshot.forEach( (childsnapshot) =>{
      all_auth.push(childsnapshot.val());
    })
    authors = all_auth;
  })
  .catch( (error)=> {
    console.log(error.message)
  })
}

grabAllAUthors();
// getAllPostlikes();

// register user account
regUserForm.addEventListener('submit', (evt)=>{
  evt.preventDefault();
  loaderBox.classList.remove('hide');
  loaderBox.classList.add('show');
  
  const user = regUserForm.username.value;
  const pass = regUserForm.password.value;
  const email = regUserForm.email.value;
  const gender = regUserForm.gender.value;

  createUserWithEmailAndPassword(dbauth,email,pass)
  .then( (cred) =>{
      const user_id = dbauth.currentUser.uid;
      
      set(dbref(dbbase, 'users/' + user_id),{
        username: user,
        gender: gender,
        image : "",
        id : user_id,
        createdAt : serverTimestamp()
      })
      
      .then(() => {
        updateDisplayName(user);

        regUserForm.reset();
        loaderBox.classList.remove('show');
        loaderBox.classList.add('hide');

        const notice = document.querySelector('.shotInfoBox');

        notice.classList.remove('hide');
        notice.classList.add('show');

        document.querySelector('#userAccountMail').innerHTML = email;

        setTimeout(() => {
          document.querySelector('.shotInfoBox').classList.remove('show');
          document.querySelector('.shotInfoBox').classList.add('hide');

          closeDialog();
          checkUserLogin();

        }, 4000);
        // console.log('check 881', dbauth.currentUser);

        document.querySelector('.pushUserNamehere').innerHTML = user;
        const abbrevName = getFirstLetterInNames(user);
      document.querySelector('.imgBox').innerHTML = `<div class="nameImage">${abbrevName}</div>`;

      })
      .catch((error) => {
        const regErr = OutputErrorToUsers(error.code);
        console.log('...setting user\'s data error', regErr);
      });
  })
  .catch( (err) => { 
    const regErr = OutputErrorToUsers(err.code)
    console.log(err.code +' || '+ err.message);
   
      loaderBox.classList.remove('show');
      loaderBox.classList.add('hide');
      const errorMsg =`<div class="RegErrorNotice">${regErr}</div>`
      document.querySelector('#pushRegError').innerHTML = errorMsg;

       setTimeout(() => {
        document.querySelector('#pushRegError').innerHTML = '';
      }, 4000);
      

      
  });

  checkUserLogin();
})

// login user account
logInForm.addEventListener('submit', (evt)=>{

    evt.preventDefault();
    loaderBox.classList.remove('hide');
    loaderBox.classList.add('show');
    
    const pass = logInForm.password.value;
    const email = logInForm.email.value;

    signInWithEmailAndPassword(dbauth,email,pass)
    .then( (cred) =>{

        logInForm.reset();
        console.log('... logged In user');
        
        loaderBox.classList.remove('show');
        loaderBox.classList.add('hide');
        closeDialog();
        checkUserLogin();
    })
    .catch( (error) => {
      const logErr = OutputErrorToUsers(error.code)
      loaderBox.classList.remove('show');
      loaderBox.classList.add('hide');
      const errorMsg =`<div class="loginErrorNotice">${logErr}</div>`
      document.querySelector('#pushLoginError').innerHTML = errorMsg;
      console.log(error.code +' || '+ error.message);

       setTimeout(() => {
        document.querySelector('#pushLoginError').innerHTML = '';
      }, 4000);
    });    
  })

// update profile picture
profilepicBox.addEventListener('click', (evt) => {
    const file = document.createElement('input');
          file.setAttribute("type", "file");
          file.setAttribute("accept", ['.png','.jpg','.jpeg']);

        let acceptedImgs = ['.png','.jpg','.jpeg','.gif'];

        
          
    file.onchange = (evt) => {
      const ImageFullPath = evt.target.files[0];

      const ext = getFileExt(evt.target.files[0].name);
      const ImgName = dbauth.currentUser.uid + ext; 

      if(acceptedImgs.includes(ext)){
            // allow file upload

                  // Create the file metadata
      const metadata = {
        contentType: 'image/jpeg'
      };
      
      // Upload file and metadata to the object 'images/name_of_image.jpg'
      const  storageRef = sto_ref(dbstorage, 'images/' + ImgName);

      const uploadTask = uploadBytesResumable(storageRef, ImageFullPath, metadata);
      
      // Listen for state changes, errors, and completion of the upload.
      uploadTask.on('state_changed',
        (snapshot) => {
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
          
          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused');
              break;
            case 'running':
              console.log('Upload is running');
              break;
          }
        }, 
        (error) => {
          switch (error.code) {
            case 'storage/unauthorized':
              // User doesn't have permission to access the object
              console.log('get permission first');
              break;
            case 'storage/canceled':
              // User canceled the upload
              console.log('upload cancelled')
              break;
      
            case 'storage/unknown':
              // Unknown error occurred, inspect error.serverResponse
              console.log(error.serverResponse);
              break;
          }
        }, 
        () => {
          // Upload completed successfully, now we can get the download URL
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              updateProfile(dbauth.currentUser, {
                displayName: dbauth.currentUser.displayName, photoURL: downloadURL
              }).then(() => {
                // Profile updated!
                console.log('profile updated');
                document.querySelector('.imgBox').innerHTML = `<img src="${downloadURL}" alt="User's profile pic">`;

                // also update the user image the firebase database
                update(dbref(dbbase, 'users/' + dbauth.currentUser.uid),{
                  image : downloadURL
                })
                .then( () => {
                  console.log('User Image Updated');
                })
                .catch( (error) => {
                  console.log(error.message);
                })

              }).catch((error) => {
                // An error occurred
                console.log(error.message);
              });
          });
        }
      );

        }else{
          // 
          alert('File Selected Not accepted');
      }



    }

    file.click();
});

// signout user
signout.addEventListener('click', (evt) =>{
  signOut(dbauth)
  .then(()=>{
    console.log('...Logged Out');
    checkUserLogin();
  })
  .catch( (error) =>{
    console.log(error.message)
  })
  
});

// authentication state listener
onAuthStateChanged(dbauth, (user) => {
  if (user) {
    // show the create post button
    document.querySelector('.showform').classList.remove('hide');
    document.querySelector('.showform').classList.add('show');
    // hide the login button
    document.querySelector('.login').classList.remove('show');
    document.querySelector('.login').classList.add('hide');
    // show the logout button
    document.querySelector('.logout').classList.remove('hide');
    document.querySelector('.logout').classList.add('show');
    // show the user name
    document.querySelector('.user').classList.remove('hide');
    document.querySelector('.user').classList.add('show');
    // show the user profile
    document.querySelector('.imgBox').classList.remove('hide');
    document.querySelector('.imgBox').classList.add('show');

    const displayname = user.displayName;
    const userImg = user.photoURL;

    document.querySelector('.pushUserNamehere').innerHTML = displayname;
    
    if(!userImg){
      const abbrevName = getFirstLetterInNames(displayname);
      document.querySelector('.imgBox').innerHTML = `<div class="nameImage">${abbrevName}</div>`;
    }else{
      document.querySelector('.imgBox').innerHTML = `<img src="${userImg}" alt="User's profile pic">`
    }

  } else {
    // User is signed out
    // hide the create post icon
    document.querySelector('.showform').classList.remove('show');
    document.querySelector('.showform').classList.add('hide');
    // show the login button
    document.querySelector('.login').classList.remove('hide');
    document.querySelector('.login').classList.add('show');
    // hide the logout button
    document.querySelector('.logout').classList.remove('show');
    document.querySelector('.logout').classList.add('hide');
    //  hide the user name
    document.querySelector('.user').classList.remove('show');
    document.querySelector('.user').classList.add('hide');
    // hide the profile image 
    document.querySelector('.imgBox').classList.remove('show');
    document.querySelector('.imgBox').classList.add('hide');
  }

});

// add a post
addPostForm.addEventListener('submit', (evt)=>{
  evt.preventDefault();
    loaderBox.classList.remove('hide');
    loaderBox.classList.add('show');
      
  const category = addPostForm.category.value;
  const post = addPostForm.quote.value;

  const author_post = {
      category : category,
      content : post,
      author_id : dbauth.currentUser.uid,
      author_name : dbauth.currentUser.displayName,
      addedOn : addCurrentDate(),
      createdAt : serverTimestamp() 
  }

  // add document to firebase
    addDoc(collectionRef, author_post)
    .then( ()=>{
        addPostForm.reset();
        loaderBox.classList.remove('show');
        loaderBox.classList.add('hide');

        const notice = document.querySelector('.pushQuoteNotice');

        notice.classList.remove('hide');
        notice.classList.add('show');
        console.log('Post added',author_post);

        setTimeout(() => {
          document.querySelector('.pushQuoteNotice').classList.remove('show');
          document.querySelector('.pushQuoteNotice').classList.add('hide');

        }, 4000);
    })
    .catch( (error) =>{
        console.log(error.message)
    })
});

// function that updates the post space
function updateQuoteSpace(showdata){
  var showpost = showdata;
  // update ; used to be here
  grabAllAUthors();
  if(showpost){
    // console.log('passed', showpost)
 
  let createdAt = showpost.addedOn;

  document.querySelector('.dname').innerHTML = showpost.author_name;
  document.querySelector('.hiddenId').value = showpost.id;
  document.querySelector('.ddate').innerHTML = createdAt;
  document.querySelector('.quotePostHidden').value = showpost.content;
  document.querySelector('.post').innerHTML = showpost.content;
  // updatelikedislikeBtns();
  // grab and update profile picture
  
  if((authors.length > 0)){

    authors.forEach( (el) => {
          if(el.id == showpost.author_id){
            if(el.image){
              document.querySelector('.profImage').innerHTML = `<img src="${el.image}" alt="User's profile pic">`;
            }else{
              const abbrevName = getFirstLetterInNames(showpost.author_name);
                document.querySelector('.profImage').innerHTML = `<div class="nameImage">${abbrevName}</div>`;
            }
          }
        })
  }
}
  getAllPostlikes();
  checkUserLogin();
}

// function to control the bottons
function controlNextPreviousButtons(){
  let t_post  = posts.length - 1; 

  let checkdetail =  parseInt(cpost.value);
  // clear if uneccessary
  if(checkdetail < 1){
    document.getElementById('prevPost').classList.add('hide');
    // console.log(checkdetail);
  }else{
    document.getElementById('prevPost').classList.remove('hide');
  }

  if( (t_post > 0) && (checkdetail < t_post) ){
    document.getElementById('nextPost').classList.remove('hide');
  }else{
    document.getElementById('nextPost').classList.add('hide');
  }
}

// read all posts
//  writing a query
var prevPost = document.querySelector('#prevPost');
var nextPost = document.querySelector('#nextPost');
var cpost = document.querySelector('.showingPost');

const q = query(collectionRef, orderBy('createdAt'));
//  real time data fetch using the onsnapshot
onSnapshot(q, (snapshot) =>{
  posts = [];
  snapshot.docs.forEach((doc) => {
      posts.push({...doc.data(), id : doc.id});
  });
        const totalPosts = posts.length;

        cpost.value = 0;

        if(totalPosts > 0){

          grabAllAUthors();

          document.querySelector('.post').innerHTML = " ";
          document.querySelector("#btns-box").classList.remove('hide');
          document.querySelector('.set_category').removeAttribute("disabled");
          document.querySelector('#prevPost').classList.remove('hide');
          document.querySelector('#nextPost').classList.remove('hide');
          // document.querySelector('.left').classList.remove('hide');
          document.querySelector('.copyAndTip').classList.remove('hide');
          document.querySelector('.profile').classList.remove('hide');
          document.querySelector('.auth_profile').classList.remove('hide');
          document.querySelector('.showResult').classList.remove('hide');

          document.querySelector('.res_sult').innerHTML = totalPosts;
          document.querySelector('.showResultResult').innerHTML = "All categories";
          
          // getTotalPostByAuthors();
          updateQuoteSpace(posts[0]);
          controlNextPreviousButtons();
        }else{
          const nopost = `<div class="nopost">
          <h2 class="nopostHead">There is No Post</h2>
      <span class="nopostSub">Sign Up and add a post</span>
      </div>`;
          document.querySelector("#btns-box").classList.add('hide');
          document.querySelector('.set_category').setAttribute("disabled","disabled");
          document.querySelector('#prevPost').classList.add('hide');
          document.querySelector('#nextPost').classList.add('hide');
          // document.querySelector('.left').classList.add('hide');
          document.querySelector('.copyAndTip').classList.add('hide');
          document.querySelector('.profile').classList.add('hide');
          document.querySelector('.auth_profile').classList.add('hide');
          document.querySelector('.showResult').classList.add('hide');
          document.querySelector('.post').innerHTML = nopost;
        }
})

// grab posts by query search
var searchposts = [];
categorySearch.addEventListener('change', async(evt)=>{
    const search = evt.target.value;
    if(search){
        //  writing a query
      const searchHandler = query(collectionRef, where('category' ,"==", search), orderBy('createdAt'));
      
      // show loader
      cirlceLoader.classList.remove('hide');
      document.querySelector('.showResultResult').innerHTML = search;

      searchposts = [];
      getDocs(searchHandler)
      .then( (snapshot) =>{
        if(snapshot.docs.length == 0){
         
          const nopost = `<div class="nopost">
          <h2 class="nopostHead">There is No Post for ${search}s</h2>
      <span class="nopostSub">Sign Up and add a post</span>
      </div>`;
          document.querySelector('.post').innerHTML = nopost; cirlceLoader.classList.add('hide');
          document.querySelector('.showResult').classList.add('hide');
          cirlceLoader.classList.add('hide');

        }
        snapshot.docs.forEach( (doc) => {
          // hide loader
        cirlceLoader.classList.add('hide');
        
          searchposts.push({...doc.data(), id: doc.id})
        });

        if(searchposts.length > 0){
          document.querySelector('.showResult').classList.remove('hide');
          posts = searchposts;
                  cpost.value = 0;
                  updateQuoteSpace(posts[0]);
                  controlNextPreviousButtons();

      document.querySelector('.res_sult').innerHTML = searchposts.length;
      document.querySelector('.showResultResult').innerHTML = `${search} category`;
        }else{
            document.querySelector('.showResult').classList.remove('hide');
            document.querySelector('.res_sult').innerHTML = searchposts.length;
            document.querySelector('.showResultResult').innerHTML = `${search} category`;
        }
        
      })
      .catch( (error) =>{
        console.log(error.message);
      });
    }else{
    cpost.value = 0;
    posts = await fetchAllPosts();
    console.log(posts);
    if(posts){
      document.querySelector('.showResult').classList.remove('hide');
    }
    document.querySelector('.res_sult').innerHTML = posts.length;
    document.querySelector('.showResultResult').innerHTML = "All categories";
    updateQuoteSpace(posts[0]);
    controlNextPreviousButtons();
    }
});

// grabs all post at once
async function fetchAllPosts(){
  cirlceLoader.classList.remove('hide');
  const grabposts = [];
  await getDocs(collectionRef)
    .then( (snapshot) =>{
      cirlceLoader.classList.add('hide');
      snapshot.forEach( (doc) => {
        grabposts.push({...doc.data(), id: doc.id})
      })
    })
    return grabposts;
}

// handle the NextPostBtn
nextPost.addEventListener('click', (evt)=> {
  

  let start = 0;
  let all_p  = posts.length - 1; 
  let curr_p = parseInt(cpost.value); 

  //  increase the current post number to fetch other documents
  curr_p = curr_p + 1; 
  
  if(curr_p > all_p){
      curr_p = start;
  }

  updateQuoteSpace(posts[curr_p]);
  cpost.value = curr_p;  

  controlNextPreviousButtons();
});

prevPost.addEventListener('click', (evt)=> {
  

  let start = 0;
  let all_p  = posts.length - 1; 
  let curr_p = parseInt(cpost.value); 

  //  increase the current post number to fetch other documents
  curr_p = curr_p - 1; 
  
  if(curr_p < 0 ){
      curr_p = start;
  }

  updateQuoteSpace(posts[curr_p]);

  cpost.value = curr_p; 
  
  controlNextPreviousButtons();
});

// handle likes posts
const likedPost = document.querySelector('.likePost');
const dislikedPost = document.querySelector('.dislikePost');

likedPost.addEventListener('click', (evt)=>{
  const getPostId = document.querySelector('.hiddenId').value;
  const userId = dbauth.currentUser.uid;

  const setLikePost = {
    post_id : getPostId,
    user_id : userId
  }

  const colReff = collection(dbstore, 'likes');

  addDoc(colReff, setLikePost)
  .then( () => {
      document.querySelector('.likePost').classList.add('hide');
      document.querySelector('.dislikePost').classList.remove('hide');
      getAllPostlikes();
  })
  .catch( error => console.log(error.message)); 
});

dislikedPost.addEventListener('click', async (evt)=>{
  const getPostId = document.querySelector('.hiddenId').value;
  const userId = dbauth.currentUser.uid;
  const newdata = [];

  const new_query = query(collection(dbstore, "likes"), where("post_id", "==", getPostId));

    const querySnapshot = await getDocs(new_query);

    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      newdata.push({...doc.data(), id: doc.id})
    });
    
    if(newdata.length > 0){
        newdata.forEach( (likes) =>{
            if((likes.post_id == getPostId) && (likes.user_id == userId)){
            deleteDoc(doc(dbstore, "likes",likes.id))
            .then( () => {
              getAllPostlikes();
            })
            .catch( error => console.log(error.message)); 
            }
        })
    }else{
      console.log('no likes');
    }
});


function checkUserLogin(){
  getAllPostlikes();
    if(dbauth.currentUser){
      document.querySelector("#btns-box .btns-cover").classList.remove('hide');
    }else{
      document.querySelector("#btns-box .btns-cover").classList.add('hide');
    }

    getTotalPostByAuthors()
}

// test phase of the author posts
async function getTotalPostByAuthors(){
   const postids = [];
   const topAuthors = [];
   const the_auth_posts = [];

    // fetch all posts
    await getDocs(collectionRef)
    .then( (snapshot) =>{
      snapshot.forEach( (doc) => {
        the_auth_posts.push({...doc.data(), id: doc.id})
      })
    })
    .catch( error => console.log(error,message))

    if(the_auth_posts){
        the_auth_posts.forEach( (post) => {
        postids.push(post.author_id);
      })
      
      const counts = {};
      const sampleArray = postids;
      
      sampleArray.forEach(function (x) { counts[x] = (counts[x] || 0) + 1; });

      var sortable = [];
        for (var auths in counts) {
            sortable.push([auths , counts[auths]]);
        }

        sortable.sort(function(a, b) {
            return a[1] - b[1];
        });
        
      sortable.forEach( (el) =>{
        authors.forEach ((el_data)=> {
            if(el_data.id == el[0]){
              topAuthors.push({...el_data, totalposts : el[1]})
            }
        })
      })
      topAuthors.reverse();
      var authprofiledata = '';
       var image = '';
       var flag = 0;
      topAuthors.forEach( (authsdata) => {
        flag = flag + 1;

        if(flag <= 4){
            if(authsdata.image){
                      image = `<img src="${authsdata.image}" alt="auth_img"></img>`
                    }else{
                      const abbrevName = getFirstLetterInNames(authsdata.username);
                      image= `<div class="nameImage">${abbrevName}</div>`
                    }

                    authprofiledata += `<div class="profile">
                          <div class="imgBox">
                              ${image}
                          </div>
                          <div class="details">
                              <p class="t2">Name : <span>${authsdata.username}</span></p>
                              <p>Posts : <span>${authsdata.totalposts} ${ (authsdata.totalposts > 1) ? 'Posts' : 'Post' } </span></p>
                          </div>
                      </div>`;
        }
      })

      document.querySelector('.auth_profile').innerHTML = authprofiledata;
      // console.log(topAuthors) 
    }
}

getTotalPostByAuthors();

async function getAllPostlikes(){
  const getPostId = document.querySelector('.hiddenId').value;
  // console.log(getPostId);
  const newdata = [];

  const new_query = query(collection(dbstore, "likes"), where("post_id", "==", getPostId));

    const querySnapshot = await getDocs(new_query);

    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      newdata.push({...doc.data(), id: doc.id})
    });

    // start
    if(dbauth.currentUser){
      const userId = dbauth.currentUser.uid;
      if(newdata.length){
  
          // check for the match between current user and the current post
          newdata.forEach( (data) =>{
  
              if((data.post_id == getPostId) && (data.user_id == userId)){
                // show the dislike button
                // console.log('Post Liked')
                document.querySelector('.likePost').classList.add('hide');
                document.querySelector('.dislikePost').classList.remove('hide');
              }else{
                // show the like button
                document.querySelector('.likePost').classList.remove('hide');
                document.querySelector('.dislikePost').classList.add('hide');
              }
          })
  
        }else{
          document.querySelector('.likePost').classList.remove('hide');
          document.querySelector('.dislikePost').classList.add('hide');
        }
    }

    // end

  document.querySelector('.numLikes').innerHTML = newdata.length;
}
