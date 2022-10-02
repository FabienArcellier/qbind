function online_counter() {
    useQuery("users", (data, loading, error, response) => {
        let online_counter_label = document.getElementById("online_counter_label");
        if (loading === false) {
            if ("results" in data) {
                const online_users = data.results;
                const online_users_counter = online_users.length;
                online_counter_label.innerText = `${online_users_counter} users online`;
            }
        } else {
            online_counter_label.innerText = "loading ...";
        }
    });
}

online_counter();
