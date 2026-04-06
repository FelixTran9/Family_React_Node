import { MessageSquare, Phone, MessageCircle } from 'lucide-react';

const FloatingSupport = () => {
  return (
    <div className="fixed right-6 bottom-6 flex flex-col space-y-3 z-50">
      <button className="w-14 h-14 bg-cyan-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:bg-cyan-700 transition transform hover:scale-110">
        <MessageSquare className="w-6 h-6" />
      </button>
      <button className="w-14 h-14 bg-green-500 rounded-full shadow-2xl flex items-center justify-center text-white hover:bg-green-600 transition transform hover:scale-110">
        <Phone className="w-6 h-6" />
      </button>
      <button className="w-14 h-14 bg-blue-500 rounded-full shadow-2xl flex items-center justify-center text-white hover:bg-blue-600 transition transform hover:scale-110">
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  );
};

export default FloatingSupport;
