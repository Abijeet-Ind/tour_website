const port = 80;
const app = require(`${__dirname}/app`);
console.log(process.env)

app.listen(port, () => {
    console.log(`listening at port ${port}`);
})



