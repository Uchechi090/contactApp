window.$on = function(target, event, cb) {
    target.addEventListener(event, cb, false);
}

var CORE = (function() {

    var modules = {};

    function addModules(module_id, mod) {
        modules[module_id] = mod;
    }

    function registerEvents(module_id, evt) {
        var theMod = modules[module_id];
        theMod.events = evt;
    }

    function triggerEvent(evt) {
        var mod;

        for(index in modules) {
            if(modules.hasOwnProperty(index)) {
                mod = modules[index];

                if(mod.events && mod.events[evt.type]) {
                    mod.events[evt.type](evt.data);
                }
            }
        }
    }

    return {
        addModules: addModules,
        registerEvents: registerEvents,
        triggerEvent: triggerEvent
    }

})();


var sb = (function() {
    
    function listen(module_id, evt) {
        CORE.registerEvents(module_id, evt);
    }

    function notify(evt) {
        CORE.triggerEvent(evt);
    }

    return {
        listen: listen,
        notify: notify
    }
})();


var contactForm = (function() {

    var id, formElement, name, phone, add;

    id = "contactForm";

    function init() {
        formElement = document.getElementById("add-contact");
        name = document.getElementsByClassName("contact-name")[0];
        phone = document.getElementsByClassName("phone-number")[0];
        add = document.getElementsByClassName("submit")[0];

        $on(add, "click", addContact);  //add is the target(element), click is the event, addContact is the action(callback) expected to take place when add is clicked
    
        sb.listen(id, {"show-form":displayForm});
    }

    function addContact(e) {
        var contactDetails = {};

        contactDetails.name = name.value; //name.value is the object above that contains the value for contact-name; value is always present all elements
        contactDetails.phone = phone.value;

        sb.notify({
            type: "contactList",
            data: contactDetails
        });

        formElement.classList.toggle("module-active"); //this determines which page is shown in the browser; "module-active" is the classname to be added

        e.preventDefault(); //e normally takes you to a particular link,preventDefault is to prevent that 
    }

    function displayForm() {
        name.value = "";
        phone.value = "";
        formElement.classList.toggle("module-active");
    }

    return {
        id: id,
        init: init,
        addContact: addContact
    }

})();

var contactDetails = (function() {
    var id, contactList, contactForm, contactUL;

    id = "contacts";

    function init() {
        contactList = document.getElementById("contacts");
        contactForm = document.getElementsByClassName("add-contact")[0];
        contactUL = document.getElementById("contact-list");

        sb.listen(id, {"contactList":addListing});

        $on(contactForm, "click", showForm);
    }

    function addListing(contacts) {   //contacts is a dummy parameter for the data "contactDetails"
        var li = document.createElement("li");

        var name = document.createElement("p"),
            nameNodeVal = document.createTextNode(contacts.name);
        name.appendChild(nameNodeVal);

        var phone = document.createElement("p"),
            phoneNodeVal = document.createTextNode(contacts.phone);
        phone.appendChild(phoneNodeVal);

        li.appendChild(name);
        li.appendChild(phone);

        contactUL.appendChild(li);

        contactList.classList.toggle("module-active");
    }

    function showForm(e) {
        sb.notify({
            type: "show-form",
            data: null
        });

        contactList.classList.toggle("module-active");

        e.preventDefault();
    }

    return {
        id: id,
        init: init,
        addListing:addListing
    }
})();

CORE.addModules(contactForm.id, contactForm);
CORE.addModules(contactDetails.id, contactDetails);

contactForm.init();
contactDetails.init();