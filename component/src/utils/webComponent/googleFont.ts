export class GoogleFont {
  private static FONT_URL = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap';

  public static appendStyleSheetToHead() {
    const head = document.getElementsByTagName('head')[0];
    const linkExists = Array.from(head.getElementsByTagName('link')).some(
      (link) => link.getAttribute('href') === GoogleFont.FONT_URL
    );
    if (!linkExists) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = GoogleFont.FONT_URL;
      head.appendChild(link);
    }
  }
}
