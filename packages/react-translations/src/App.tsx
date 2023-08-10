import { Trans } from './lib'

function App() {
	return (
		<Trans
			components={{
				p: <p />
			}}
			message={'Uma experiência que <p>aumenta a aquisição</p> de doentes e filiação hospitalar'}
		/>
	)
}

export default App
