import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :root {
    --dark-gray: #1E1E1E;
    --light-gray: #F5F5F5;
    --medium-gray: #CCCCCC;
    --cyan: #4ECDC4;
    --dark-cyan: #45B7A0;
    --orange: #FF6B6B;
  }

  body {
    font-family: 'Roboto', sans-serif;
    background-color: var(--dark-gray);
    min-height: 100vh;
    color: var(--light-gray);
  }

  #root {
    min-height: 100vh;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Montserrat', sans-serif;
    color: var(--cyan);
  }

  /* 스텝 페이지들의 공통 스타일 */
  .step-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    position: relative;
    z-index: 1;
  }

  .step-progress-bar {
    margin-top: 80px;
    margin-bottom: 4rem;
  }

  h1.step-title {
    font-family: 'Montserrat', sans-serif;
    color: var(--cyan);
    font-size: 2rem;
    text-align: center;
    margin-top: 2rem;
    margin-bottom: 3rem;
  }
`;

export default GlobalStyle;
