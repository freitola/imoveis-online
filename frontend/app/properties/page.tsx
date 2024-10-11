// app/properties/page.tsx
'use client';

import { useEffect, useState } from 'react';
import PropertyCard from '../../components/PropertyCard';
import { getProperties } from '../../services/api/propertyService';

export default function PropertiesPage() {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    async function fetchProperties() {
      const data = await getProperties();
      setProperties(data);
    }
    fetchProperties();
  }, []);

  return (
    <div>
      <h1>Lista de Imóveis</h1>
      <div className="property-list">
        {properties.map((property: any) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
}