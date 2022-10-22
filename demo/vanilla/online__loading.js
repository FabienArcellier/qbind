function online__loading() {
    useQuery("users", (data, loading, error, response) => {
        let online__loading = document.getElementById("online__loading");
        if (loading === false) {
            online__loading.classList.add("hidden");
        } else {
            online__loading.classList.remove("hidden");
        }
    });
}

online__loading();
