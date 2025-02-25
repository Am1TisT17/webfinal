// Глобальные переменные
let recipes = [];
let currentUser = null;
const categories = ['breakfast', 'lunch', 'dinner', 'desserts', 'drinks'];

// Получение информации о текущем пользователе
async function getCurrentUser() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const response = await fetch('/api/users/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            const user = await response.json();
            currentUser = user;
            return user;
        }
    } catch (error) {
        console.error('Error fetching user:', error);
    }
    return null;
}

// Получение и отображение рецептов
async function fetchRecipes() {
    try {
        const response = await fetch('/api/recipes');
        recipes = await response.json();
        await getCurrentUser();
        displayRecipes(recipes);
        setupEventListeners();
    } catch (error) {
        console.error('Ошибка при загрузке рецептов:', error);
        showError('Не удалось загрузить рецепты');
    }
}

// Получение изображения для рецепта
function getImageForRecipe(recipe) {
    return recipe.image || 'https://via.placeholder.com/300'; // Заглушка, если нет изображения
}

// Отображение рецептов
function displayRecipes(items) {
    const recipesContainer = document.getElementById('recipes');
    if (!recipesContainer) return;

    recipesContainer.innerHTML = items.map(recipe => `
        <div class="recipe-item" data-category="${recipe.category}">
            <img src="${getImageForRecipe(recipe)}" alt="${recipe.title}" class="recipe-image">
            <div class="recipe-content">
                <h3 class="recipe-title">${recipe.title}</h3>
                <span class="recipe-category">${capitalizeFirst(recipe.category)}</span>
                <p class="recipe-description">${recipe.description}</p>
                <div class="recipe-actions">
                    <button onclick="viewRecipe('${recipe._id}')" class="btn btn-primary">
                        <i class="fas fa-eye"></i> View
                    </button>
                    ${currentUser && (currentUser._id === recipe.createdBy || currentUser.role === 'admin') ? `
                        <button onclick="editRecipe('${recipe._id}')" class="btn btn-secondary">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button onclick="deleteRecipe('${recipe._id}')" class="btn btn-danger">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// Настройка обработчиков событий
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');

    if (searchInput) {
        searchInput.addEventListener('input', filterRecipes);
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterRecipes);
    }
}

// Фильтрация рецептов
function filterRecipes() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;

    const filteredItems = recipes.filter(recipe => {
        const matchesSearch = recipe.title.toLowerCase().includes(searchTerm) ||
                            recipe.description.toLowerCase().includes(searchTerm);
        const matchesCategory = !category || recipe.category === category;
        return matchesSearch && matchesCategory;
    });

    displayRecipes(filteredItems);
}

// Открытие страницы с подробной информацией о рецепте
function viewRecipe(recipeId) {
    window.location.href = `/recipe.html?id=${recipeId}`;
}

// Редактирование рецепта
function editRecipe(recipeId) {
    window.location.href = `edit-recipe.html?id=${recipeId}`;
}

// Удаление рецепта
async function deleteRecipe(recipeId) {
    if (!confirm('Вы уверены, что хотите удалить этот рецепт?')) return;

    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`/api/recipes/${recipeId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            recipes = recipes.filter(r => r._id !== recipeId);
            displayRecipes(recipes);
            showSuccess('Рецепт успешно удален');
        } else {
            throw new Error('Не удалось удалить рецепт');
        }
    } catch (error) {
        showError('Ошибка при удалении рецепта');
    }
}

// Вспомогательные функции
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function showError(message) {
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        ${message}
    `;
    document.body.appendChild(errorMessage);
    setTimeout(() => errorMessage.remove(), 3000);
}

function showSuccess(message) {
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.innerHTML = `
        <i class="fas fa-check-circle"></i>
        ${message}
    `;
    document.body.appendChild(successMessage);
    setTimeout(() => successMessage.remove(), 3000);
}

// Функция выхода
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    window.location.href = 'login.html';
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    fetchRecipes();
});
