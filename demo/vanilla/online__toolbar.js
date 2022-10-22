function online__toolbar() {
    let online_toolbar_refresh = document.getElementById("online__actions__refresh");
    online_toolbar_refresh.onclick = () => {
        // The following 2 lines simulate for the demo the fact
        // that there are more or less users online
        const online_users = Math.floor(Math.random() * 20) + 15;
        replaceQuery('users', `https://randomuser.me/api/?results=${online_users}`);

        invalidateQuery('users');
    };
}

online__toolbar();
