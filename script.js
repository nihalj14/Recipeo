const searchBtn = document.querySelector(".search_icon");
const recipeContainer = document.querySelector(".card_container");
const searchInput = document.querySelector(".search_input");

// light mode and dark mode implementation
const darkBtn = document.querySelector(".dark-mode");
const lightBtn = document.querySelector(".light-mode");
const body = document.querySelector("body");

darkBtn.addEventListener("click", () => {
  darkBtn.style.display = "none";
  lightBtn.style.display = "block";
  body.classList.toggle("dark");
});

lightBtn.addEventListener("click", () => {
  darkBtn.style.display = "block";
  lightBtn.style.display = "none";
  body.classList.toggle("dark");
});

// handling events for input search
searchBtn.addEventListener("click", () => {
  let userInp = document.querySelector("#search_input_id").value.trim();
  getRecipeData(userInp);
});
searchInput.addEventListener("keydown", (e) => {
  if (e.code === "Enter") {
    let userInp = document.querySelector("#search_input_id").value.trim();
    getRecipeData(userInp);
  }
});

//to display initial recipes on page load
getRecipeData("pasta");

function pagination(recipeArr,startIDx,endIDx){
    let newHtml = ""
    recipeArr.slice(startIDx,endIDx).forEach((meal) => {
        newHtml += `
                <div class="card_hover_container">

                    <div class="view_recipe_card">
                        <span class="view_recipe_btn" id="${meal.id}">View Recipe</span>
                    </div>

                    <div class="card">

                        <div class="card_img">
                            <img src="${meal.image_url}" alt="card_image">
                        </div>
                        <h3 class="card_txt">${meal.title}</h3>


                    </div>

                </div>
                `;
      });
      
      recipeContainer.innerHTML = newHtml;
}

// const paginationPrevBtn = document.querySelector(".pagination_prev")
// const paginationNextBtn = document.querySelector(".pagination_next")

// paginationNextBtn.addEventListener("click",()=>{
    
// })

// to get recipes using fetch
function getRecipeData(userInput) {
  fetch(`https://forkify-api.herokuapp.com/api/v2/recipes?search=${userInput}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.results) {
        pagination(data.data.recipes,0,9);
        
      } else {
        let newHtml = "<h3>&#9888; Sorry, we could not find any recipe :(</h3>";
        
      recipeContainer.innerHTML = newHtml;
      }

    });
}

// recipe detail view button
const recipeDetailContainer = document.querySelector(
  ".recipe_detail_container"
);
recipeContainer.addEventListener("click", (event) => {
  if (event.target && event.target.classList.contains("view_recipe_btn")) {
    const recipeId = event.target.id;

    getRecipeDetails(recipeId); // Fetch and display recipe details
    recipeDetailContainer.style.display = "block";
  }
});

// Store the current recipe detail for bookmarking
let currentRecipeDetail = null;

function getRecipeDetails(reciId) {
  fetch(`https://forkify-api.herokuapp.com/api/v2/recipes/${reciId}`)
    .then((res) => res.json())
    .then((data) => {
      // Store all relevant data for bookmarking
      currentRecipeDetail = {
        id: data.data.recipe.id,
        title: data.data.recipe.title,
        servings: data.data.recipe.servings,
        cookingTime: `${data.data.recipe.cooking_time} MINUTES`,
        ingredients: data.data.recipe.ingredients.map(
          (ing) => `-> ${ing.quantity ? ing.quantity : ""} ${ing.unit ? ing.unit : ""} ${ing.description}`
        ),
        directions: data.data.recipe.source_url,
        image: data.data.recipe.image_url
      };
      let html = `<h1 class="recipe_detail_heading">${
        data.data.recipe.title
      }</h1>
        <div class="recipe_info">
            <div class="recipe_info_div">
                <span>
                    <i class="fa-regular fa-clock"></i> 
                    ${data.data.recipe.cooking_time} MINUTES
                </span>
                <span>
                    <i class="fa-solid fa-users"></i>
                    <span class="servings">${
                      data.data.recipe.servings
                    }</span> SERVINGS
                    <i class="fa-solid fa-minus dec_serving"></i>
                    <i class="fa-solid fa-plus inc_serving"></i>
                </span> 
            </div>
          <i class="fa-solid fa-bookmark bookmark"></i>

        </div>
        <div class="recipe_detail_close_btn">
          <i class="fa-solid fa-close"></i>
        </div>
        <div class="recipe_ingredients">
          <h2>Recipe Ingredients</h2>
          <div class="ingredients_container">
          ${data.data.recipe.ingredients
            .map(
              (ing) =>
                `<p>-> ${ing.quantity ? ing.quantity : ""} ${
                  ing.unit ? ing.unit : ""
                } ${ing.description}</p>`
            )
            .join("")}
          </div>
          <a href="${
            data.data.recipe.source_url
          }" class="directions">Directions</a>
        </div>`;

      recipeDetailContainer.innerHTML = html;

      // Event listener for the dynamically added close button
      const recipeDetailCloseBtn = document.querySelector(
        ".recipe_detail_close_btn"
      );
      recipeDetailCloseBtn.addEventListener("click", () => {
        recipeDetailContainer.style.display = "none";
      });

      let servings = data.data.recipe.servings;
      const ingredientArr = data.data.recipe.ingredients;
      const incServings = document.querySelector(".inc_serving");
      const decServings = document.querySelector(".dec_serving");
      const servingsElement = document.querySelector(".servings");
      incServings.addEventListener("click", () => {
        servings++;
        updateServings(servings, ingredientArr);
        servingsElement.textContent = servings;
      });
      decServings.addEventListener("click", () => {
        if (servings > 1) {
          servings--;
          updateServings(servings, ingredientArr);
          servingsElement.textContent = servings;
        }
      });
    });
}

// to update servings of the recipe

function updateServings(newServings, ingredientArr) {
  const ingredientsContainer = document.querySelector(".ingredients_container");

  const updatedIngredients = ingredientArr
    .map((ingredient) => {
      const updatedQuantity = ingredient.quantity
        ? (
            (ingredient.quantity * newServings) /
            ingredientArr[0].quantity
          ).toFixed(2)
        : "";
      return `<p>-> ${updatedQuantity} ${
        ingredient.unit ? ingredient.unit : ""
      } ${ingredient.description}</p>`;
    })
    .join("");

  ingredientsContainer.innerHTML = updatedIngredients;
}

// Bookmarking feature implementation
let bookmarkedRecipes = JSON.parse(localStorage.getItem("bookmarkedRecipes")) || [];

// Add bookmark event listener after recipe details are loaded
document.addEventListener("click", function (event) {
  if (event.target && event.target.classList.contains("bookmark")) {
    // Use the currentRecipeDetail for bookmarking
    if (!currentRecipeDetail) return;
    // Avoid duplicate bookmarks by id
    if (!bookmarkedRecipes.some(r => r.id === currentRecipeDetail.id)) {
      bookmarkedRecipes.push(currentRecipeDetail);
      localStorage.setItem("bookmarkedRecipes", JSON.stringify(bookmarkedRecipes));
      alert("Recipe bookmarked!");
    } else {
      alert("Recipe already bookmarked!");
    }
  }
});

// Show bookmarked recipes in card format when Saved Recipe button is clicked
function showBookmarkedRecipesAsCards() {
  const recipeDetailContainer = document.querySelector(".recipe_detail_container");
  bookmarkedRecipes = JSON.parse(localStorage.getItem("bookmarkedRecipes")) || [];
  if (bookmarkedRecipes.length === 0) {
    recipeDetailContainer.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <h2 style="text-align:center;">No bookmarked recipes yet!</h2>
        <span class="recipe_detail_close_btn" style="cursor:pointer;font-size:2rem;"><i class="fa-solid fa-close"></i></span>
      </div>
    `;
  } else {
    recipeDetailContainer.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <h2 class="recipe_detail_heading">Bookmarked Recipes</h2>
        <span class="recipe_detail_close_btn" style="cursor:pointer;font-size:2rem;"><i class="fa-solid fa-close"></i></span>
      </div>
      <div class="card_container" style="margin-top:2rem;">
        ${bookmarkedRecipes.map(recipe => `
          <div class="card_hover_container">
            <div class="card">
              <div class="card_img">
                <img src="${recipe.image}" alt="Recipe Image" />
              </div>
              <h3 class="card_txt">${recipe.title}</h3>
              <div style="padding:0.5rem 1rem;">
                <p>${recipe.cookingTime}</p>
                <p>Servings: ${recipe.servings}</p>
                <a href="${recipe.directions}" target="_blank" class="directions">Directions</a>
                <span class="view_recipe_btn" data-id="${recipe.id}" style="display:inline-block;margin-top:10px;cursor:pointer;background:#e9803f;color:#fff;padding:0.5rem 1rem;border-radius:5px;">View Recipe</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
  recipeDetailContainer.style.display = "block";
  // Add close event for the saved recipe popup
  const closeBtn = recipeDetailContainer.querySelector(".recipe_detail_close_btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      recipeDetailContainer.style.display = "none";
    });
  }
  // Add event listener for view_recipe_btn in saved recipes
  recipeDetailContainer.querySelectorAll('.view_recipe_btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      // Try to fetch from API, fallback to local data if not found
      fetch(`https://forkify-api.herokuapp.com/api/v2/recipes/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.data && data.data.recipe) {
            getRecipeDetails(id);
          } else {
            // Fallback: show saved details from localStorage
            const recipe = bookmarkedRecipes.find(r => r.id === id);
            if (recipe) {
              recipeDetailContainer.innerHTML = `
                <h1 class="recipe_detail_heading">${recipe.title}</h1>
                <div class="recipe_info">
                  <div class="recipe_info_div">
                    <span><i class="fa-regular fa-clock"></i> ${recipe.cookingTime}</span>
                    <span><i class="fa-solid fa-users"></i> <span class="servings">${recipe.servings}</span> SERVINGS</span>
                  </div>
                  <i class="fa-solid fa-bookmark bookmark"></i>
                </div>
                <div class="card_img" style="text-align:center;margin:1rem 0;">
                  <img src="${recipe.image}" alt="Recipe Image" style="width:250px;height:250px;object-fit:cover;border-radius:1rem;"/>
                </div>
                <div class="recipe_detail_close_btn"><i class="fa-solid fa-close"></i></div>
                <div class="recipe_ingredients">
                  <h2>Recipe Ingredients</h2>
                  <div class="ingredients_container">
                    ${recipe.ingredients.map(ing => `<p>${ing}</p>`).join('')}
                  </div>
                  <a href="${recipe.directions}" class="directions" target="_blank">Directions</a>
                </div>
              `;
              // Add close event
              const closeBtn = recipeDetailContainer.querySelector(".recipe_detail_close_btn");
              if (closeBtn) {
                closeBtn.addEventListener("click", () => {
                  recipeDetailContainer.style.display = "none";
                });
              }
            }
          }
        })
        .catch(() => {
          // Fallback: show saved details from localStorage
          const recipe = bookmarkedRecipes.find(r => r.id === id);
          if (recipe) {
            recipeDetailContainer.innerHTML = `
              <h1 class="recipe_detail_heading">${recipe.title}</h1>
              <div class="recipe_info">
                <div class="recipe_info_div">
                  <span><i class="fa-regular fa-clock"></i> ${recipe.cookingTime}</span>
                  <span><i class="fa-solid fa-users"></i> <span class="servings">${recipe.servings}</span> SERVINGS</span>
                </div>
                <i class="fa-solid fa-bookmark bookmark"></i>
              </div>
              <div class="card_img" style="text-align:center;margin:1rem 0;">
                <img src="${recipe.image}" alt="Recipe Image" style="width:250px;height:250px;object-fit:cover;border-radius:1rem;"/>
              </div>
              <div class="recipe_detail_close_btn"><i class="fa-solid fa-close"></i></div>
              <div class="recipe_ingredients">
                <h2>Recipe Ingredients</h2>
                <div class="ingredients_container">
                  ${recipe.ingredients.map(ing => `<p>${ing}</p>`).join('')}
                </div>
                <a href="${recipe.directions}" class="directions" target="_blank">Directions</a>
              </div>
            `;
            // Add close event
            const closeBtn = recipeDetailContainer.querySelector(".recipe_detail_close_btn");
            if (closeBtn) {
              closeBtn.addEventListener("click", () => {
                recipeDetailContainer.style.display = "none";
              });
            }
          }
        });
    });
  });
}

// Replace previous event for Saved Recipe button
const savedRecipeBtn = document.querySelector(".saved_recipe");
savedRecipeBtn.addEventListener("click", function (e) {
  e.preventDefault();
  showBookmarkedRecipesAsCards();
});
