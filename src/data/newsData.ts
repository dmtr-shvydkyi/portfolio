export const designNews = [
  "The golden ratio has been used in design and architecture for thousands of years. Helvetica is one of the world's most widely used typefaces.",
  "Minimalist design principles are revolutionizing user interfaces across all platforms. Less is more in the digital age.",
  "Color psychology plays a crucial role in brand identity and user experience design. Every hue tells a story.",
  "Typography is the voice of design. The right font can make or break a user's first impression.",
  "Responsive design is no longer optional. Mobile-first approaches are shaping the future of web development.",
  "Design systems create consistency and efficiency. They're the foundation of scalable product design.",
  "User research drives better design decisions. Empathy is the designer's most powerful tool.",
  "Accessibility in design isn't just nice to have—it's essential for creating inclusive experiences.",
  "Micro-interactions add personality to digital products. The devil is in the details.",
  "Design thinking methodology is transforming how companies approach problem-solving and innovation.",
  "Dark mode design trends are evolving beyond simple color inversions. Context matters more than ever.",
  "Sustainable design practices are becoming mainstream. Designers are thinking about environmental impact.",
  "AI-powered design tools are augmenting human creativity, not replacing it. The future is collaborative.",
  "Motion design brings static interfaces to life. Animation is the language of modern digital experiences.",
  "Design tokens create consistency across teams and platforms. They're the building blocks of design systems."
];

export function getRandomNews(): string {
  const randomIndex = Math.floor(Math.random() * designNews.length);
  return designNews[randomIndex];
}


