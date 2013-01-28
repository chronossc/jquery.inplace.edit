# jquery.inplace.edit

Another In place editor for jQuery, in beta stage.

## Usage

To setup inplaceEdit:

    $(function() {
        $(".liveEdit").inplaceEdit({css_input_classes: 'input-mini'});
    })

It load proper html and put everything functional.

**css_input_classes** is applied to $("input").addClass(), so you can customize. More on that after.

A inplaceEdit isn't very much without possibility to save it. Take a look on events for it.

## Events

You can bind to some events, every event have ".inplaceEdit" namespace.

#### inputLoad

Fired when you click on ".liveEdit" and input was show. Use it to apply masks and other custon js.

Example using jquery.meio.mask plugin:

    $(function() {
        $(".liveEdit").inplaceEdit({css_input_classes: 'input-mini'})
            .bind("inputLoad.inplaceEdit", function(e) {
                $(e.target).select().setMask('decimal')});
    });

#### inputUpdate

Fired when we have a update in field. Updates happens when user press Enter or Tab. Is up to you validate and save updated data.

Example:

    $(function() {
        $(".liveEdit").inplaceEdit({css_input_classes: 'input-mini'})
            .bind("inputUpdate.inplaceEdit", function(instance, $input, $inputContainer, $valueContainer, e) {
                // You will receive many objects to make possibilities bigger
                $.post('.', {id: instance.$el.data('id'), value: instance.value});
            });
    });



