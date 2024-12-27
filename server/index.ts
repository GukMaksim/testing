import { createApp } from './app.js';

const app = createApp();
const port = 3001;

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
