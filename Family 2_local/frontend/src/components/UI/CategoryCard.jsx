import { Link } from 'react-router-dom';

const CategoryCard = ({ category }) => {
  return (
    <Link 
      to={`/special-offers?category=${encodeURIComponent(category.name)}`}
      className="bg-white border-2 border-gray-100 rounded-2xl p-4 text-center group cursor-pointer hover:border-cyan-500 hover:shadow-xl transition-all duration-300 flex flex-col items-center"
    >
      <div className="mb-4 w-full aspect-square overflow-hidden rounded-xl bg-gray-50">
        <img 
          src={category.image} 
          alt={category.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
        />
      </div>
      <div className="font-bold text-gray-700 group-hover:text-cyan-600 transition">
        {category.name}
      </div>
    </Link>
  );
};

export default CategoryCard;
