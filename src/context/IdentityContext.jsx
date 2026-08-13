import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react'
import { generateTitle, generateBuilderId } from '../lib/titleEngine'

const IdentityContext = createContext(null)

let memberSeq = 0
const newMember = (patch = {}) => ({
  id: `m${++memberSeq}`,
  name: '',
  dataUrl: '',
  crop: { x: 0, y: 0, scale: 1 },
  ...patch,
})

const initialState = {
  view: 'landing', // 'landing' | 'studio'
  mode: 'solo', // 'solo' | 'squad'
  format: 'card', // active output: card | pfp | share | squad

  name: '',
  stack: 'AI',
  customStack: '',
  energy: 'MAKER',
  builderTitle: generateTitle('AI', 'MAKER', ''),
  builderId: generateBuilderId(),
  style: 'goan',

  photoFile: null,
  photoDataUrl: '',
  photoMeta: null,
  photoCrop: { x: 0, y: 0, scale: 1 },

  teamName: '',
  squad: [newMember(), newMember()],
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, view: action.payload }

    case 'SET_MODE': {
      const mode = action.payload
      return {
        ...state,
        mode,
        format: mode === 'squad' ? 'squad' : state.format === 'squad' ? 'card' : state.format,
      }
    }

    case 'SET_FORMAT':
      return { ...state, format: action.payload }

    case 'SET_NAME':
      return {
        ...state,
        name: action.payload,
        builderTitle: generateTitle(state.stack, state.energy, action.payload),
      }

    case 'SET_STACK':
      return {
        ...state,
        stack: action.payload,
        builderTitle: generateTitle(action.payload, state.energy, state.name),
      }

    case 'SET_CUSTOM_STACK':
      return { ...state, customStack: action.payload }

    case 'SET_ENERGY':
      return {
        ...state,
        energy: action.payload,
        builderTitle: generateTitle(state.stack, action.payload, state.name),
      }

    case 'SET_TITLE':
      return { ...state, builderTitle: action.payload }

    case 'SET_STYLE':
      return { ...state, style: action.payload }

    case 'SET_PHOTO':
      return {
        ...state,
        photoFile: action.payload.file ?? null,
        photoDataUrl: action.payload.dataUrl || '',
        photoMeta: action.payload.meta ?? null,
        photoCrop: { x: 0, y: 0, scale: 1 },
      }

    case 'SET_CROP':
      return { ...state, photoCrop: { ...state.photoCrop, ...action.payload } }

    case 'SET_TEAM_NAME':
      return { ...state, teamName: action.payload }

    case 'ADD_MEMBER':
      return state.squad.length >= 4 ? state : { ...state, squad: [...state.squad, newMember()] }

    case 'REMOVE_MEMBER':
      return state.squad.length <= 1
        ? state
        : { ...state, squad: state.squad.filter((m) => m.id !== action.payload) }

    case 'UPDATE_MEMBER':
      return {
        ...state,
        squad: state.squad.map((m) =>
          m.id === action.payload.id ? { ...m, ...action.payload.patch } : m
        ),
      }

    case 'RESET':
      memberSeq = 0
      return {
        ...initialState,
        view: 'studio',
        builderId: generateBuilderId(),
        squad: [newMember(), newMember()],
      }

    default:
      return state
  }
}

export function IdentityProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const setView = useCallback((view) => dispatch({ type: 'SET_VIEW', payload: view }), [])

  /**
   * Has the user given us enough to show something real? The brief forbids a
   * gate before the result, so this only ever governs copy and CTA labels —
   * never whether the preview renders.
   */
  const ready = useMemo(() => {
    if (state.mode === 'squad') return state.squad.some((m) => m.dataUrl)
    return Boolean(state.photoDataUrl)
  }, [state.mode, state.squad, state.photoDataUrl])

  const value = useMemo(
    () => ({ state, dispatch, setView, ready }),
    [state, setView, ready]
  )

  return <IdentityContext.Provider value={value}>{children}</IdentityContext.Provider>
}

export function useIdentity() {
  const ctx = useContext(IdentityContext)
  if (!ctx) throw new Error('useIdentity must be used within IdentityProvider')
  return ctx
}
