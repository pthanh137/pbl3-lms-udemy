/**
 * Generate a unique tech-related image URL for each course based on course ID
 * This ensures the same course always gets the same image
 */
export const getCourseImage = (courseId) => {
  if (!courseId) {
    return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1920&q=80';
  }

  // List of tech-related images from Unsplash - mỗi ảnh khác nhau
  const techImages = [
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1920&q=90', // Code on screen
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1920&q=90', // Developer workspace
    'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1920&q=90', // Laptop with code
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1920&q=90', // Code editor
    'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1920&q=90', // Programming setup
    'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=1920&q=90', // Tech workspace
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=90', // Team coding
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1920&q=90', // Laptop code
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1920&q=90', // Developer
    'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1920&q=90', // Code screen
    'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1920&q=90', // Programming
    'https://images.unsplash.com/photo-1555066931-bf19f8fd1085?w=1920&q=90', // Developer workspace
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=90', // Data analytics
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&q=90', // Charts and code
    'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=1920&q=90', // Code terminal
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&q=90', // Python code
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1920&q=90', // Developer coding
    'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1920&q=90', // Code editor dark
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1920&q=90', // Coding session
  ];

  // Use course ID to consistently select the same image for the same course
  const imageIndex = parseInt(courseId) % techImages.length;
  return techImages[imageIndex];
};

