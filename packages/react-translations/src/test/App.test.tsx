import { render, screen } from '@testing-library/react'
import { it, expect } from 'vitest'

it('App', () => {
	render(
		<div>Unitary TEst</div>
	)
	
	expect(screen.getByText('Unitary TEst'))
	.toBeInTheDocument()
})
