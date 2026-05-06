import './patchPostMessage'
import './axios-setup'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {PorscheDesignSystemProvider} from '@porsche-design-system/components-react'
import './index.css'
import './i18n'

import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PorscheDesignSystemProvider theme="dark">
      <App />
    </PorscheDesignSystemProvider>
  </StrictMode>,
)
