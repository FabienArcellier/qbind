function online__list() {
    useQuery("users", (data, loading, error, response) => {
        let online_list = document.getElementById("online__list");
        if (loading === false) {
            online_list.innerHTML = '';
            if ("results" in data) {
                const online_users = data.results;
                for (const user_index in online_users) {
                    const online_user = online_users[user_index];
                    const user_node = document.createElement('div');
                    const user_picture_node = document.createElement('img');
                    user_node.innerHTML = `
                        <div class="flex">
                            <img class="flex-none w-12 h-12 my-2 mr-2" src="${online_user.picture.thumbnail}" />
                            <div class="flex-1 my-2 mr-2">
                                <div>${online_user.login.username}</div>
                                <div class="italic text-sm">${online_user.location.country}</div>
                            </div>
                        </div>

                    `;
                    online_list.append(user_node);
                }
                online_list.classList.remove("hidden");
            }
        } else {
            online_list.classList.add("hidden");
        }
    });
}

online__list();
