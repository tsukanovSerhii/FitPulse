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
import { updateTimerSettings } from '@/features/workoutSession'
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

  it('runs a free workout and saves it as a personal plan', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Почати' }))
    const picker = await screen.findByRole('dialog', { name: 'Додати вправу' })
    await user.type(within(picker).getByRole('searchbox'), 'Жим штанги лежачи')
    await user.click(within(picker).getByRole('button', { name: /Жим штанги лежачи/ }))

    expect(await screen.findByRole('heading', { name: 'Жим штанги лежачи' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Підхід 1 виконано/ }))
    await user.click(screen.getByRole('button', { name: /Підхід 2 виконано/ }))
    expect(screen.getAllByLabelText('виконано')).toHaveLength(2)
    // No set target: there is always a next set to log
    expect(screen.getByRole('button', { name: /Підхід 3 виконано/ })).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: 'Завершити' })[0])
    const summary = await screen.findByRole('dialog', { name: 'Чудова робота' })
    await user.click(within(summary).getByRole('checkbox', { name: /Зберегти як програму/ }))
    const name = within(summary).getByLabelText('Назва програми')
    await user.clear(name)
    await user.type(name, 'Мій жим')
    await user.click(within(summary).getByRole('button', { name: 'Зберегти' }))

    await waitFor(() => expect(store.getState().workoutSession.isActive).toBe(false))
    const plan = store.getState().workoutPlan.plans.find((p) => p.name === 'Мій жим')
    expect(plan).toBeDefined()
    const day = Object.values(plan!.schedule).find((items) => items.length > 0)!
    expect(day).toHaveLength(1)
    expect(day[0]).toMatchObject({ exerciseId: 'ex-bench-press', sets: 2 })
  })

  it('uses the rest time and auto start from the timer settings', async () => {
    updateTimerSettings({ restMode: 'fixed', fixedSeconds: 45 })
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getAllByRole('button', { name: /Понеділок/ })[0])
    expect(await screen.findByText(/відпочинок 45 с/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Підхід 1 виконано/ }))
    expect(store.getState().workoutSession.restTimer).toMatchObject({ isRunning: true, totalSeconds: 45 })

    updateTimerSettings({ autoStart: false })
    await user.click(screen.getByRole('button', { name: 'Пропустити' }))
    await user.click(screen.getByRole('button', { name: /Підхід 2 виконано/ }))
    expect(store.getState().workoutSession.restTimer.isRunning).toBe(false)

    updateTimerSettings({ restMode: 'exercise', autoStart: true })
    await user.click(screen.getByRole('button', { name: 'Скасувати тренування' }))
    await user.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Скасувати тренування' }))
  })
})
