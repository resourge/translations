import { ref } from 'vue'

function useCounter() {
	const count = ref(0)

	return count
}

it('App', () => {
	const count = useCounter()
	expect(count.value).toBe(0)
})
