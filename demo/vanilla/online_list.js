function online_list() {
    useQuery("users", (data, loading, error, response) => {
        let online_list_loading = document.getElementById("online_list__loading");
        let online_list_block = document.getElementById("online_list__block");
        if (loading === false) {
            online_list_loading.classList.add("hidden");
            online_list_block.childNodes = Array();
            if ("results" in data) {
                const online_users = data.results;
                for (const user_index in online_users) {
                    const online_user = online_users[user_index];
                    const user_node = document.createElement('div');
                    user_node.innerText = online_user.login.username;
                    online_list_block.append(user_node);
                }

                online_list_block.classList.remove("hidden");
            }
        } else {
            online_list_loading.classList.remove("hidden");
            online_list_block.classList.add("hidden");
            online_list_loading.innerText = "loading ...";
        }
    });
}

online_list();
