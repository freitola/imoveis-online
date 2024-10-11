// components/PropertyCard.tsx
import Link from 'next/link';

export default function PropertyCard({ property }: { property: any }) {
  return (
    <div className="property-card">
    <div className="property-info">
      <p><strong>Preço:</strong> R${property.price}</p>
      <p><strong>Localização:</strong> {property.location}</p>
      <p><strong>Quartos:</strong> {property.bedrooms}</p>
      <p><strong>Banheiros:</strong> {property.bathrooms}</p>
      <p><strong>Tamanho:</strong> {property.size} m²</p>
      <p><strong>Tipo:</strong> {property.type}</p>
    </div>
    <Link href={`/properties/${property.id}`}>
          <button className="details-button">Ver Detalhes</button>
        </Link>
    </div>
  );
}