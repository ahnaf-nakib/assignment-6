document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const categoryList = document.getElementById('category-list');
    const categorySpinner = document.getElementById('category-spinner');
    const plantCardsContainer = document.getElementById('plant-cards-container');
    const plantsSpinner = document.getElementById('plants-spinner');
    const cartList = document.getElementById('cart-list');
    const totalPriceElement = document.getElementById('total-price');
    const plantModal = document.getElementById('plant-modal');
    const modalBodyContent = document.getElementById('modal-body-content');
    const modalCloseBtn = document.querySelector('.modal-close');
    const cartPlaceholder = document.querySelector('.cart-item-placeholder');

    // --- State Variables ---
    let cart = [];
    let activeCategoryId = null;
    let currentPlants = []; // Store category plants for cart and modal use

    // --- Utility Functions ---

    // Function to show/hide a loading spinner
    const toggleSpinner = (spinner, isVisible) => {
        if (spinner) spinner.classList.toggle('visible', isVisible);
    };

    // Function to calculate and update total price
    const updateTotalPrice = () => {
        const total = cart.reduce((sum, item) => sum + item.price, 0);
        totalPriceElement.textContent = `$${total.toFixed(2)}`;
    };

    // --- Main Functionalities ---

    // 1. Load Tree Categories dynamically
    const loadCategories = async () => {
        toggleSpinner(categorySpinner, true);
        try {
            const response = await fetch('https://openapi.programming-hero.com/api/categories');
            if (!response.ok) throw new Error(`Network response was not ok: ${response.status}`);
            const apiResponse = await response.json();
            const categories = apiResponse.categories || [];

            if (categories.length > 0) {
                categoryList.innerHTML = '';
                categories.forEach(category => {
                    const button = document.createElement('button');
                    button.classList.add('category-button');
                    button.textContent = category.category_name;
                    button.dataset.id = category.id;
                    categoryList.appendChild(button);
                });

                const firstButton = categoryList.querySelector('.category-button');
                if (firstButton) {
                    firstButton.classList.add('active');
                    activeCategoryId = firstButton.dataset.id;
                    loadPlantsByCategory(activeCategoryId);
                }
            } else {
                categoryList.innerHTML = '<p>No categories available.</p>';
            }
        } catch (error) {
            console.error('Failed to load categories:', error);
            categoryList.innerHTML = '<p>Failed to load categories. Please try again.</p>';
        } finally {
            toggleSpinner(categorySpinner, false);
        }
    };

    // 2. Load Tree Data by Category (3-column, 6 cards max)
    const loadPlantsByCategory = async (categoryId) => {
        toggleSpinner(plantsSpinner, true);
        plantCardsContainer.innerHTML = '';
        try {
            const response = await fetch(`https://openapi.programming-hero.com/api/category/${categoryId}`);
            if (!response.ok) throw new Error(`Network response was not ok: ${response.status}`);
            const apiResponse = await response.json();
            const plants = apiResponse.plants || [];
            currentPlants = plants.slice(0, 6); // Store first 6 plants

            console.log('Loaded currentPlants:', currentPlants); // Debug log

            if (plants.length > 0) {
                const plantsToShow = plants.slice(0, 6); // Show first 6 plants
                plantsToShow.forEach((plant, index) => {
                    const plantId = plant._id || plant.id || `plant-${index}`; // Fallback ID if _id or id is missing
                    console.log('Creating card for plant ID:', plantId, 'Name:', plant.name); // Debug log
                    const card = document.createElement('div');
                    card.classList.add('plant-card');
                    card.setAttribute('data-plant-index', index); // Store index for fallback
                    card.innerHTML = `
                        <img src="${plant.image || 'https://via.placeholder.com/300x200?text=Plant+Image'}" alt="${plant.name}" onerror="this.src='https://via.placeholder.com/300x200?text=Plant+Image'">
                        <h4 class="plant-name-btn" data-id="${plantId}">${plant.name}</h4>
                        <p class="short-description">${plant.details?.description?.substring(0, 100) || plant.description?.substring(0, 100) || 'No description provided'}...</p>
                        <p class="category-name">Category: ${plant.category || 'Unknown'}</p>
                        <p class="price">$${parseFloat(plant.price || 0).toFixed(2)}</p>
                        <button class="add-to-cart" data-id="${plantId}" data-index="${index}">Add to Cart</button>
                    `;
                    plantCardsContainer.appendChild(card);
                });
            } else {
                plantCardsContainer.innerHTML = '<p style="text-align:center;">No plants available in this category.</p>';
            }
        } catch (error) {
            console.error('Failed to load plants:', error);
            plantCardsContainer.innerHTML = '<p style="text-align:center;">Failed to load plants. Please try again.</p>';
        } finally {
            toggleSpinner(plantsSpinner, false);
        }
    };

    // 3. Add to Cart functionality (using category data)
    const addToCart = (plantId, index) => {
        console.log('addToCart called with plantId:', plantId, 'index:', index); // Debug log
        let plant = null;
        if (plantId) {
            plant = currentPlants.find(p => p._id === plantId || p.id === plantId);
        }
        if (!plant && index !== undefined) {
            plant = currentPlants[index]; // Fallback to index
        }
        console.log('Found plant in currentPlants:', plant); // Debug log
        if (!plant) {
            console.error('Plant not found in currentPlants for id:', plantId, 'or index:', index);
            alert('Error: Plant data not available.');
            return;
        }
        const existingItem = cart.find(item => item.id === (plant._id || plant.id || `plant-${index}`));
        if (existingItem) {
            alert(`${plant.name} is already in your cart.`);
            return;
        }

        const plantUniqueId = plant._id || plant.id || `plant-${index}`;
        const newCartItem = {
            id: plantUniqueId,
            name: plant.name,
            price: parseFloat(plant.price || 0)
        };
        cart.push(newCartItem);

        if (cartPlaceholder) cartPlaceholder.style.display = 'none';

        const cartItemLi = document.createElement('li');
        cartItemLi.classList.add('cart-item');
        cartItemLi.dataset.id = plantUniqueId;
        cartItemLi.innerHTML = `
            <div class="cart-item-info">
                <span class="cart-item-name">${plant.name}</span>
                <span class="cart-item-price">$${parseFloat(plant.price || 0).toFixed(2)}</span>
            </div>
            <button class="remove-item-btn" data-id="${plantUniqueId}">&times;</button>
        `;
        cartList.appendChild(cartItemLi);

        updateTotalPrice();
        console.log('Added to cart:', newCartItem); // Debug log
    };

    // 4. Remove from Cart functionality
    const removeFromCart = (plantId) => {
        cart = cart.filter(item => item.id !== plantId);
        const itemToRemove = document.querySelector(`.cart-item[data-id="${plantId}"]`);
        if (itemToRemove) itemToRemove.remove();
        if (cart.length === 0 && cartPlaceholder) cartPlaceholder.style.display = 'block';
        updateTotalPrice();
        console.log('Removed from cart, new cart:', cart); // Debug log
    };

    // 5. Modal on Card Click with Plant Details
    const showPlantDetailsModal = async (plantId) => {
        const modalSpinner = modalBodyContent.querySelector('.loading-spinner');
        toggleSpinner(modalSpinner, true);
        modalBodyContent.innerHTML = '<div class="loading-spinner"></div>';
        plantModal.classList.remove('hidden');

        try {
            console.log('Fetching plant details for plantId:', plantId); // Debug log
            const response = await fetch(`https://openapi.programming-hero.com/api/plant/${plantId}`);
            if (!response.ok) throw new Error(`Network response was not ok: ${response.status}`);
            const apiResponse = await response.json();
            console.log('API Response for plant details:', apiResponse); // Debug log
            let plant = apiResponse.data;

            if (!plant && currentPlants.length > 0) {
                // Fallback to currentPlants if detail API fails
                const fallbackPlant = currentPlants.find(p => p._id === plantId || p.id === plantId);
                if (fallbackPlant) {
                    plant = fallbackPlant;
                    console.log('Using fallback plant from currentPlants:', plant);
                }
            }

            if (plant) {
                modalBodyContent.innerHTML = `
                    <div class="modal-plant-details">
                        <img src="${plant.image || 'https://via.placeholder.com/300x200?text=Plant+Image'}" alt="${plant.name}" onerror="this.src='https://via.placeholder.com/300x200?text=Plant+Image'">
                        <h3>${plant.name}</h3>
                        <p><strong>Category:</strong> ${plant.category || 'Not specified'}</p>
                        <p><strong>Price:</strong> $${parseFloat(plant.price || 0).toFixed(2)}</p>
                        <p><strong>Description:</strong> ${plant.details?.description || plant.description || 'No description available'}</p>
                        <p><strong>Scientific Name:</strong> ${plant.scientific_name || 'Not available'}</p>
                        <p><strong>Care Instructions:</strong> ${plant.care || 'Not provided'}</p>
                    </div>
                `;
            } else {
                modalBodyContent.innerHTML = '<p>Plant details not available.</p>';
            }
        } catch (error) {
            console.error('Failed to load plant details:', error);
            modalBodyContent.innerHTML = '<p>Failed to load plant details. Please try again.</p>';
        } finally {
            toggleSpinner(modalSpinner, false);
        }
    };

    // --- Event Listeners Delegation ---

    plantCardsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('plant-name-btn')) {
            const plantId = event.target.dataset.id;
            console.log('Modal clicked for plantId:', plantId); // Debug log
            showPlantDetailsModal(plantId);
        }
        if (event.target.classList.contains('add-to-cart')) {
            const plantId = event.target.dataset.id;
            const index = event.target.dataset.index;
            console.log('Add to cart clicked for plantId:', plantId, 'index:', index); // Debug log
            if (!plantId && index === undefined) {
                console.error('No plantId or index found on button');
                alert('Error: No plant ID available.');
                return;
            }
            addToCart(plantId, index); // Use category data directly
        }
    });

    cartList.addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-item-btn')) {
            const plantId = event.target.dataset.id;
            removeFromCart(plantId);
        }
    });

    categoryList.addEventListener('click', (event) => {
        if (event.target.classList.contains('category-button')) {
            const currentActive = document.querySelector('.category-button.active');
            if (currentActive) currentActive.classList.remove('active');
            event.target.classList.add('active');
            activeCategoryId = event.target.dataset.id;
            loadPlantsByCategory(activeCategoryId);
        }
    });

    modalCloseBtn.addEventListener('click', () => {
        plantModal.classList.add('hidden');
    });

    window.addEventListener('click', (event) => {
        if (event.target === plantModal) plantModal.classList.add('hidden');
    });

    // --- Initial Call ---
    loadCategories();
});