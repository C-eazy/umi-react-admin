import styled from 'styled-components';

export const PdfStyle = styled.div`
  /* body { */
  margin: 0;
  /* background-color: #525659; */
  font-family:
    Segoe UI,
    Tahoma,
    sans-serif;
  /* } */

  .Example input,
  .Example button {
    font: inherit;
  }

  .Example header {
    background-color: #323639;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
    padding: 20px;
    color: white;
  }

  .Example header h1 {
    font-size: inherit;
    margin: 0;
  }

  .Example__container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 10px 0;
    padding: 10px;
  }

  .Example__container__load {
    margin-top: 1em;
    color: white;
  }

  .Example__container__document {
    margin: 1em 0;
  }

  .Example__container__document .react-pdf__Document {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .Example__container__document .react-pdf__Page {
    max-width: calc(100% - 2em);
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
    margin: 1em;
  }

  .Example__container__document .react-pdf__Page canvas {
    max-width: 100%;
    height: auto !important;
  }

  .Example__container__document .react-pdf__message {
    padding: 20px;
    color: white;
  }
`;
