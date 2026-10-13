import { INITIAL_STEP, acceptSignal } from './steps.js'

/**
 * Local STM. Steps only — signal ids live in the reception module.
 */
export class LocalStm {
  constructor(initialStep = INITIAL_STEP) {
    this._step = initialStep
  }

  get step() {
    return this._step
  }

  /**
   * @param {string} signal
   * @returns {{ accepted: boolean, step: string }}
   */
  accept(signal) {
    const result = acceptSignal(this._step, signal)
    if (!result.accepted) {
      return { accepted: false, step: this._step }
    }
    this._step = result.step
    return { accepted: true, step: this._step }
  }

  reset() {
    this._step = INITIAL_STEP
  }
}
