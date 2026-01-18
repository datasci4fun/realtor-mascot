// Testimonials data for home page

export interface Testimonial {
  text: string
  author: string
  location: string
  rating: number
}

export const testimonials: Testimonial[] = [
  {
    text: "Greg made our first home purchase incredibly smooth. His expertise in the DFW market was invaluable, and he was always available to answer our questions.",
    author: "Sarah M.",
    location: "Little Elm",
    rating: 5
  },
  {
    text: "Professional, responsive, and always had our best interests in mind. Greg's negotiation skills helped us close in record time!",
    author: "John D.",
    location: "Plano",
    rating: 5
  },
  {
    text: "Highly recommend Greg to anyone looking to buy in DFW. His local knowledge and dedication made all the difference in our home search.",
    author: "Maria L.",
    location: "Garland",
    rating: 5
  }
]
