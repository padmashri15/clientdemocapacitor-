import React, { useEffect, useState } from 'react';
import { ProductCard } from '@luxury/shared-lib/components';
import { 
  CommunicationService, 
  StorageService, 
  NativeFeaturesService,
  mockProducts 
} from '@luxury/shared-lib';
import { Product } from '@luxury/shared-lib/types';
import { Network } from '@capacitor/network';

/**
 * App #1: Product List
 * Displays a list of luxury products and navigates to App #2 for details
 */
function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    initializeApp();
    setupNetworkListener();
  }, []);

  const initializeApp = async () => {
    // Check permissions
    const permissions = await NativeFeaturesService.checkAllPermissions();
    console.log('Permissions status:', permissions);

    // Load products
    await loadProducts();
  };

  const setupNetworkListener = async () => {
    const status = await Network.getStatus();
    setIsOnline(status.connected);

    Network.addListener('networkStatusChange', status => {
      setIsOnline(status.connected);
      if (status.connected) {
        syncOfflineData();
      }
    });
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      // Try to load from cache first
      const cachedProducts = await StorageService.getAllProducts();
      
      if (cachedProducts.length > 0) {
        setProducts(cachedProducts);
        setLoading(false);
      } else {
        // Use mock products for demo
        setProducts(mockProducts);
        
        // Cache mock products
        for (const product of mockProducts) {
          await StorageService.saveProduct(product);
        }
      }

      // In production, fetch from API:
      // if (isOnline) {
      //   const response = await fetch('https://api.luxury-retail.com/products');
      //   const data = await response.json();
      //   setProducts(data.products);
      // }
      
      await StorageService.setLastSyncTime(Date.now());
    } catch (error) {
      console.error('Failed to load products:', error);
      setProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  };

  const syncOfflineData = async () => {
    const queuedRequests = await StorageService.getQueuedRequests();
    
    for (const request of queuedRequests) {
      try {
        await fetch(request.url, {
          method: request.method,
          headers: request.headers,
          body: request.body ? JSON.stringify(request.body) : undefined,
        });
        await StorageService.removeFromQueue(request.id);
      } catch (error) {
        console.error('Failed to sync request:', error);
      }
    }
  };

  const handleProductClick = (product: Product) => {
    // Send message to Container App to navigate to App2
    console.log('Product clicked:', product.name);
    
    // Check if we're running inside an iframe (micro-frontend mode)
    if (window.parent !== window) {
      // Send message to parent (Container App)
      window.parent.postMessage({
        type: 'NAVIGATE_TO_APP2',
        product: product
      }, '*');
    } else {
      // Fallback for standalone mode
      CommunicationService.navigateToApp('app2', `/product/${product.id}`, {
        product
      });
    }
  };

  const handleCameraClick = async () => {
    try {
      const hasPermission = await NativeFeaturesService.checkCameraPermissions();
      if (!hasPermission) {
        const granted = await NativeFeaturesService.requestCameraPermissions();
        if (!granted) {
          alert('Camera permission is required');
          return;
        }
      }
      
      const imageUrl = await NativeFeaturesService.takePicture({
        quality: 90,
        allowEditing: true
      });
      console.log('Captured image:', imageUrl);
      
      // Send notification
      await NativeFeaturesService.sendLocalNotification({
        title: 'Photo Captured',
        body: 'Your product photo has been saved',
        id: Date.now(),
      });
      
      alert('Photo captured successfully!');
    } catch (error) {
      console.error('Camera error:', error);
      alert('Failed to access camera: ' + (error as Error).message);
    }
  };

  const handleLocationClick = async () => {
    try {
      const hasPermission = await NativeFeaturesService.checkLocationPermissions();
      if (!hasPermission) {
        const granted = await NativeFeaturesService.requestLocationPermissions();
        if (!granted) {
          alert('Location permission is required');
          return;
        }
      }
      
      const position = await NativeFeaturesService.getCurrentLocation();
      console.log('Current location:', position.coords);
      
      // Could use location to show nearby stores
      alert(`Location:\nLatitude: ${position.coords.latitude.toFixed(4)}\nLongitude: ${position.coords.longitude.toFixed(4)}`);
    } catch (error) {
      console.error('Location error:', error);
      alert('Failed to get location: ' + (error as Error).message);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['All', ...new Set(products.map(p => p.category))];

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: 1400, margin: '0 auto', padding: 20 }}>
      {/* Header */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 30,
        borderBottom: '2px solid #000',
        paddingBottom: 20
      }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700 }}>LUXURY COLLECTION</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleCameraClick}
            style={{
              padding: '10px 20px',
              backgroundColor: '#000',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600
            }}
          >
            📷 Camera
          </button>
          <button
            onClick={handleLocationClick}
            style={{
              padding: '10px 20px',
              backgroundColor: '#000',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600
            }}
          >
            📍 Location
          </button>
        </div>
      </header>

      {/* Status Bar */}
      {!isOnline && (
        <div style={{
          backgroundColor: '#ff9800',
          color: 'white',
          padding: '10px 20px',
          borderRadius: 4,
          marginBottom: 20,
          textAlign: 'center',
          fontWeight: 600
        }}>
          ⚠️ You are offline. Showing cached products.
        </div>
      )}

      {/* Search and Filters */}
      <div style={{ marginBottom: 30 }}>
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 20px',
            fontSize: 16,
            border: '1px solid #ddd',
            borderRadius: 4,
            marginBottom: 20
          }}
        />
        
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                padding: '8px 16px',
                backgroundColor: selectedCategory === category ? '#000' : '#f5f5f5',
                color: selectedCategory === category ? '#fff' : '#000',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                textTransform: 'capitalize',
                fontSize: 14,
                fontWeight: 600
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, fontSize: 18 }}>
          Loading products...
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 24
        }}>
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={handleProductClick}
              layout="grid"
            />
          ))}
        </div>
      )}

      {filteredProducts.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: 60, color: '#666' }}>
          No products found
        </div>
      )}

      {/* Footer */}
      <footer style={{ 
        marginTop: 60, 
        paddingTop: 30, 
        borderTop: '1px solid #ddd',
        textAlign: 'center',
        color: '#666',
        fontSize: 14
      }}>
        <p>App #1: Product List • Platform: {NativeFeaturesService.getPlatform()}</p>
        <p style={{ marginTop: 10, fontSize: 12 }}>
          {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} • {isOnline ? '🟢 Online' : '🔴 Offline'}
        </p>
      </footer>
    </div>
  );
}

export default App;