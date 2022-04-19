# Frontend Mentor - NFT preview card component solution

This is a solution to the [NFT preview card component challenge on Frontend Mentor](https://www.frontendmentor.io/challenges/nft-preview-card-component-SbdUL_w0U). Frontend Mentor challenges help you improve your coding skills by building realistic projects. 

## Table of contents

- [Overview](#overview)
  - [The challenge](#the-challenge)
  - [Screenshot](#screenshot)
  - [Links](#links)
- [My process](#my-process)
  - [Built with](#built-with)
  - [What I learned](#what-i-learned)
  - [Continued development](#continued-development)
  - [Useful resources](#useful-resources)
- [Author](#author)
- [Acknowledgments](#acknowledgments)

**Note: Delete this note and update the table of contents based on what sections you keep.**

## Overview

### The challenge

Users should be able to:

- View the optimal layout depending on their device's screen size
- See hover states for interactive elements

### Screenshot

[./screenshots/screenshot1440.png]
[./screenshots/screenshot375.png]

### Links

- Solution URL: [Add solution URL here](https://your-solution-url.com)
- Live Site URL: [Add live site URL here](https://your-live-site-url.com)

## My process

I started with adding all of the content in HTML, then I thought about what classes I needed. After the HTML and custom classes were done I begain to style it linking to an external CSS file. After creating the file I created custom variables in the root for all of the font weights and colors, this makes it easy to change any of these in the future. I found it easier to start with the mobile design since there wasn't a lot of changes that needed to be made for larger screen sizes. I created the card and centered it on the page using Display: Flex. I started at with the image of the card and then styled the content as I worked down the card. After all the content in the card was styled I addes some spacing variables in the root so that I could adjust line-height and spacing in my classes. 

After the mobile design was completed I added in two media queries to create responsiveness for various screens. The first media query which was required for the challenge adjusts the card size for screens that are over 60em. The second media query wasn't required, but adds some responsiveness for screens that are that are between 40em and 59em, like iPads. After the responsiveness was completed I added in the hover effects for the three required links. The one I found most challenging was the image hover. I was able to do it by creating a class called Overlay and that had the background color variable I created using hsla to give it a opacity, and the view icon which was centered. I then set the opacity to 0 on the overlay which made it hidden, then I put the container class with a hover to change the opacity of my overlay class to a 1.

### Built with

- Semantic HTML5 markup
- CSS custom properties
- Root variables
- Mobile-first workflow

### What I learned

Use this section to recap over some of your major learnings while working through this project. Writing these out and providing code samples of areas you want to highlight is a great way to reinforce your own knowledge.

To see how you can add code snippets, see below:

.overlay {
	height: 100%;
	width: 100%;
	border-radius: 10px;
	background-color: var(--primary-clr-cyan-hover);
	background-image: url(/images/icon-view.svg);
	background-repeat: no-repeat;
	background-position: center;
	cursor: pointer;
	opacity: 0;
}

.card-pic-container:hover .overlay {
	opacity: 1;
}

If you want more help with writing markdown, we'd recommend checking out [The Markdown Guide](https://www.markdownguide.org/) to learn more.

**Note: Delete this note and the content within this section and replace with your own learnings.**

### Continued development

Use this section to outline areas that you want to continue focusing on in future projects. These could be concepts you're still not completely comfortable with or techniques you found useful that you want to refine and perfect.

**Note: Delete this note and the content within this section and replace with your own plans for continued development.**

### Useful resources

- [Example resource 1](https://www.example.com) - This helped me for XYZ reason. I really liked this pattern and will use it going forward.
- [Example resource 2](https://www.example.com) - This is an amazing article which helped me finally understand XYZ. I'd recommend it to anyone still learning this concept.

**Note: Delete this note and replace the list above with resources that helped you during the challenge. These could come in handy for anyone viewing your solution or for yourself when you look back on this project in the future.**

## Author

- Website - [Add your name here](https://www.your-site.com)
- Frontend Mentor - [@yourusername](https://www.frontendmentor.io/profile/yourusername)
- Twitter - [@yourusername](https://www.twitter.com/yourusername)

**Note: Delete this note and add/remove/edit lines above based on what links you'd like to share.**

## Acknowledgments

This is where you can give a hat tip to anyone who helped you out on this project. Perhaps you worked in a team or got some inspiration from someone else's solution. This is the perfect place to give them some credit.

**Note: Delete this note and edit this section's content as necessary. If you completed this challenge by yourself, feel free to delete this section entirely.**
