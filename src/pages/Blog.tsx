import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Blog() {
  const blogPosts = [
    {
      id: 1,
      title: "The Future of Supply Chain Management",
      excerpt: "Explore how AI and automation are revolutionizing supply chain operations and what it means for the logistics industry.",
      image: "https://images.unsplash.com/photo-1566843972142-a7fcb2c1870b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      date: "March 15, 2024",
      readTime: "5 min read",
      category: "Technology"
    },
    {
      id: 2,
      title: "Sustainable Logistics: A Green Future",
      excerpt: "Discover how companies are implementing eco-friendly practices in their logistics operations to reduce environmental impact.",
      image: "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      date: "March 10, 2024",
      readTime: "4 min read",
      category: "Sustainability"
    },
    {
      id: 3,
      title: "Last-Mile Delivery Optimization",
      excerpt: "Learn about the latest strategies and technologies being used to optimize last-mile delivery operations.",
      image: "https://images.unsplash.com/photo-1580674285054-bed31e145f59?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      date: "March 5, 2024",
      readTime: "6 min read",
      category: "Operations"
    },
    {
      id: 4,
      title: "Global Supply Chain Resilience",
      excerpt: "Understanding how to build resilient supply chains in an increasingly unpredictable global marketplace.",
      image: "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      date: "March 1, 2024",
      readTime: "7 min read",
      category: "Strategy"
    }
  ];

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-4">Logistics Insights</h1>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Stay updated with the latest trends, insights, and innovations in the logistics and supply chain industry.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {blogPosts.map((post) => (
            <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    {post.category}
                  </span>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    {post.date}
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    {post.readTime}
                  </div>
                </div>
                <h2 className="text-xl font-semibold mb-3">{post.title}</h2>
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                <Link
                  to="#"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700"
                >
                  Read More <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}