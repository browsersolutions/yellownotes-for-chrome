



// check if the user is authenticated
checkSessionJWTValidity()
  .then(isValid => {
      console.log('JWT is valid:', isValid);
if (isValid){
    console.debug("JWT is valid - show menu accordingly");
    fetchAndDisplayStaticContent("../fragments/en_US/view_my_public_profile_page_header.html", "view_my_public_profile_main_text").then(() => {});
    fetchAndDisplayStaticContent("../fragments/en_US/sidebar_fragment_authenticated.html", "sidebar").then(() => {
        //page_display_login_status();
       // login_logout_action();
      });
    
      page_display_login_status();
}else{
    console.debug("JWT is not valid - show menu accordingly");
    fetchAndDisplayStaticContent("../fragments/en_US/view_my_public_profile_page_header.html", "view_my_public_profile_main_text").then(() => {});
    fetchAndDisplayStaticContent("../fragments/en_US/sidebar_fragment_unauthenticated.html", "sidebar").then(() => {
        //page_display_login_status();
        //login_logout_action();
      
      });
      
      page_display_login_status();
    }

  })
  .catch(error => {
      console.error('Error:', error.message);
  });



