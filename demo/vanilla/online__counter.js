function online__counter() {
    useQuery("users", (data, loading, error, response) => {
        let online_counter = document.getElementById("online__counter");
        if (loading === false) {
            if ("results" in data) {
                const online_users = data.results;
                const online_users_counter = online_users.length;
                online_counter.innerText = `${online_users_counter} users online`;
            }
        } else {
            online_counter.innerText = "";
        }
    });
}

online__counter();
