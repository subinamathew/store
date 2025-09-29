document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.getElementById('product-gallery');
    const colorFilter = document.getElementById('color-filter');
    const sizeFilter = document.getElementById('size-filter');
    const stockFilter = document.getElementById('stock-filter');
    const categoryLinks = document.querySelectorAll('.category-link');
    const resetButton = document.getElementById('reset-filters');
    let productsData = [];

    // Helper function to render a single product card
    const renderProduct = (product) => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image_url}" alt="${product.name}">
            <div class="product-details">
                <h3>${product.name}</h3>
                <p><strong>SKU:</strong> ${product.sku}</p>
                <p><strong>Beschreibung:</strong> ${product.description}</p>
                <p><strong>Verfügbare Farben:</strong> ${product.colors.join(', ')}</p>
                <p><strong>Verfügbare Größen:</strong> ${product.sizes.join(', ')}</p>
            </div>
        `;
        gallery.appendChild(productCard);
    };

    // Main function to fetch data and render the gallery
    const loadProducts = async () => {
        try {
            const response = await fetch('products.json');
            productsData = await response.json();
            populateFilters(productsData);
            renderFilteredProducts(productsData);
        } catch (error) {
            console.error("Fehler beim Laden der Produkte:", error);
            gallery.innerHTML = '<p>Produkte konnten nicht geladen werden.</p>';
        }
    };

    // Populate filter dropdowns based on available products
    const populateFilters = (products) => {
        const colors = new Set();
        const sizes = new Set();

        products.forEach(p => {
            p.colors.forEach(c => colors.add(c));
            p.sizes.forEach(s => sizes.add(s));
        });

        colors.forEach(c => {
            const option = document.createElement('option');
            option.value = c;
            option.textContent = c;
            colorFilter.appendChild(option);
        });

        sizes.forEach(s => {
            const option = document.createElement('option');
            option.value = s;
            option.textContent = s;
            sizeFilter.appendChild(option);
        });
    };

    // Filter and render products based on selected criteria
    const renderFilteredProducts = (products, activeCategory = 'Alle') => {
        gallery.innerHTML = '';
        const selectedColor = colorFilter.value;
        const selectedSize = sizeFilter.value;
        const selectedStock = stockFilter.value;
        
        let filteredProducts = products.filter(product => {
            const isCategoryMatch = activeCategory === 'Alle' || product.category === activeCategory || product.category === 'Zubehör';
            const isColorMatch = !selectedColor || product.colors.includes(selectedColor);
            const isSizeMatch = !selectedSize || product.sizes.includes(selectedSize);
            const isInStock = selectedStock !== 'in-stock' || Object.values(product.stock).some(s => s > 0);

            return isCategoryMatch && isColorMatch && isSizeMatch && isInStock;
        });

        if (filteredProducts.length === 0) {
            gallery.innerHTML = '<p>Keine Produkte gefunden, die Ihren Kriterien entsprechen. 😔</p>';
        } else {
            filteredProducts.forEach(renderProduct);
        }
    };

    // Event Listeners for Filters
    colorFilter.addEventListener('change', () => renderFilteredProducts(productsData, document.querySelector('.category-link.active')?.dataset.category));
    sizeFilter.addEventListener('change', () => renderFilteredProducts(productsData, document.querySelector('.category-link.active')?.dataset.category));
    stockFilter.addEventListener('change', () => renderFilteredProducts(productsData, document.querySelector('.category-link.active')?.dataset.category));
    resetButton.addEventListener('click', () => {
        colorFilter.value = '';
        sizeFilter.value = '';
        stockFilter.value = '';
        renderFilteredProducts(productsData, document.querySelector('.category-link.active')?.dataset.category);
    });

    // Event Listeners for Category Navigation
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            // Remove active class from all links
            categoryLinks.forEach(l => l.classList.remove('active'));
            // Add active class to the clicked link
            e.target.classList.add('active');
            const category = e.target.dataset.category;
            renderFilteredProducts(productsData, category);
        });
    });

    // Initial load
    loadProducts();
});