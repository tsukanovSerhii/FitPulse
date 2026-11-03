// @vitest-environment jsdom
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import { beforeAll, describe, expect, it } from 'vitest'
import { store } from '@/app/store/store'
import { fetchExercises } from '@/features/exercises/model'
import { fetchPlans } from '@/features/workoutPlan/model'
import { ActiveWorkoutPage } from './ActiveWorkoutPage'

const renderPage = () =>
  render(
    <Provider store={store}>
      <MemoryRouter>
        <ActiveWorkoutPage />
        <Toaster />
      </MemoryRouter>
    </Provider>,
  )

describe('workout mode', () => {
  beforeAll(async () => {
    localStorage.setItem('fitpulse_auth_session_v1', JSON.stringify('test-user'))
    await store.dispatch(fetchExercises())
    await store.dispatch(fetchPlans())
  })

  it('starts a plan day, records sets and can undo the last one', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getAllByRole('button', { name: /Понеділок/ })[0])
    expect(await screen.findByRole('heading', { name: 'Жим штанги лежачи' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Підхід 1 виконано/ }))
    expect(screen.getAllByLabelText('виконано')).toHaveLength(1)
    expect(screen.getByRole('button', { name: /Підхід 2 виконано/ })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Скасувати$/ }))
    expect(screen.queryAllByLabelText('виконано')).toHaveLength(0)
    expect(store.getState().workoutSession.isActive).toBe(true)
  })

  it('cancels the workout after confirmation', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Скасувати тренування' }))
    const dialog = await screen.findByRole('alertdialog', { name: 'Скасувати тренування?' })
    await user.click(within(dialog).getByRole('button', { name: 'Скасувати тренування' }))

    await waitFor(() => expect(store.getState().workoutSession.isActive).toBe(false))
  })
})
