// function addtocart(proid) {
//   $.ajax({
//     url: "/cart/" + proid,
//     method: "get",
//     success: (response) => {
//       console.log("Server response:", response); // Debugging line
//       if (response.status) {
//         let count = $("#cart-count").html();
//         count = parseInt(count) + 1;

//         $("#cart-count").html(count);
//         alert("Added");
//       }
//     },
//     error: (xhr, status, error) => {
//       if (xhr.status === 401) {
//         window.location.href = "/login"; // Redirect to login page
//       } else {
//         console.error("Error:", error);
//       }
//     },
//   });
// }
var searchelement = document.getElementById("searchvalue");
var searchdiv = document.getElementById("search-content");
var div = document.getElementById("product-div");
var spinnerdiv = document.getElementById("spinner");
var html = '';

function handlesubmit(e) {
  e.preventDefault();
  console.log(spinnerdiv);
  console.log(searchdiv);
  let value = searchelement.value;
  spinnerdiv.style.display = "block";
  $.ajax({
    url: "/get-product-search/" + value,
    method: "get",
    success: (response) => {
      spinnerdiv.style.display = "none";
      div.style.display = "none";
      searchdiv.style.display = "block";
      console.log("Server response:", response); // Debugging line
      if (response.status) {
        let data = response.data;
        html = `<h3 class="text-center mb-4">Search Results</h3>
                <div class="row">`;

        data.forEach((product) => {
          html += `<div class="col">
                      <div class="card product-card" onclick="handleOnclick('${product._id}')">
                        <img class="card-img-top" src="/product-images/${product._id}.jpg" alt="${product.Name}">
                        <div class="card-body">
                          <h5 class="card-title">${product.Name}</h5>
                          <p class="card-text">${product.Description}</p>
                          <p class="card-text"><small>${product.Category}</small></p>
                          <p class="price">₹${product.Price}</p>
                          <button onclick="addtocart('${product._id}')" class="btn btn-primary w-100">View Product</button>
                        </div>
                      </div>
                    </div>`;
        });

        html += `</div>`;
        searchdiv.innerHTML = html; // Append the content to the search div
      } else {
        alert("No products found.");
      }
    },
    error: (xhr, status, error) => {
      spinnerdiv.style.display = "none";
      if (xhr.status === 401) {
        window.location.href = "/"; // Redirect to login page
      } else {
        console.error("Error:", error);
      }
    },
  });
}
