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

const paginationPrevBtn = document.querySelector(".pagination_prev")
const paginationNextBtn = document.querySelector(".pagination_next")

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

// to get details of each recipe
function getRecipeDetails(reciId) {
  fetch(`https://forkify-api.herokuapp.com/api/v2/recipes/${reciId}`)
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
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
