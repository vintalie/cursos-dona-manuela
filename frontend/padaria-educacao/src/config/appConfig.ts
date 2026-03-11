export const APP_TITLE = "Padaria Educação";

export function setDocumentTitle(pageTitle: string) {
  if (pageTitle) {
    document.title = `${pageTitle} | ${APP_TITLE}`;
  } else {
    document.title = APP_TITLE;
  }
}

