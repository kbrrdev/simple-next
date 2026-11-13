import '@testing-library/jest-dom/vitest';

// jsdom does not lay out pages, so it has no scrollIntoView.
Element.prototype.scrollIntoView = () => {};
