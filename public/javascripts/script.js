function addtocart(proid) {
  $.ajax({
    url: "/cart/" + proid,
    method: "get",
    success: (response) => {
      console.log("Server response:", response); // Debugging line
      if (response.status) {
        let count = $("#cart-count").html();
        count = parseInt(count) + 1;

        $("#cart-count").html(count);
        alert("Added");
      }
    },
    error: (xhr, status, error) => {
      if (xhr.status === 401) {
        window.location.href = "/login"; // Redirect to login page
      } else {
        console.error("Error:", error);
      }
    },
  });
}
