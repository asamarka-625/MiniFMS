function getDocumentId() {
    const url = window.location.href;
    const parts = url.split('/');
    const documentId = parts[parts.length - 1];
    return documentId;
}

const documentId = getDocumentId();

async function loadDocumentData() {
    try {
        const response = await apiRequest(url=`/api/v1/forms/${documentId}`, options={
            method: 'GET'
        });

        if (response.ok) {
            const data = await response.json();
            fillFormWithData(data);
        }
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
    }
}

function fillFormWithData(data) {
    Object.entries(data).forEach(([key, value]) => {
        try {
            const elementId = key.replace(/_/g, '-');

            const element = document.getElementById(elementId);

            if (element) {
                let stringValue = String(value || '').trim().replaceAll('~', '');

                if (inputConfigurations.contains(elementId)) {
                    element.value = stringValue;
                    if (stringValue && stringValue.length > 0) element.classList.add("filled");

                } else {
                    if (element.classList.contains('checkbox')) {
                        if (Boolean(value)) {
                            element.classList.add("filled");
                            element.value = '✓';
                        }

                    } else {
                        const spans = element.getElementsByTagName('input');

                        if (spans.length > 0) {
                            const chars = stringValue.split('');

                            for (let i = 0; i < spans.length && i < chars.length; i++) {
                                spans[i].value = chars[i] || '';
                                if (chars[i] && chars[i].length > 0) spans[i].classList.add("filled");
                            }
                        } else {
                            element.value = value;
                        }
                    }
                }
            }
        } catch (error) {
            console.error(`Ошибка при обработке ключа ${key}:`, error);
        }
    });
}

document.addEventListener('DOMContentLoaded', async function() {
    document.getElementById("create-form").style.display = "none";
    document.getElementById("update-form").addEventListener('click', async function(e) {
        showLoadingOverlay();

        let data = {};
        fieldConfigurations.forEach(config => {
            const parent = document.getElementById(config.id);
            const name_field = config.id.replaceAll("-", "_");
            let value_field = '';

            if (parent) {
                const children = parent.children;
                Array.from(children).forEach(child => {
                    value_field += child.value;
                });
            }
            data[name_field] = value_field;
        });
        inputConfigurations.forEach(input_id => {
            const input = document.getElementById(input_id);
            const name_field = input_id.replaceAll("-", "_");
            let value_field = '';

            if (input) {
                value_field = input.value;
            }
            data[name_field] = value_field;
        });

        data["gender_male"] = document.getElementById("gender-male").classList.contains('filled') ? true : false;
        data["gender_female"] = document.getElementById("gender-female").classList.contains('filled') ? true : false;
        data["resident_visa"] = document.getElementById("resident-visa").classList.contains('filled') ? true : false;
        data["resident_card"] = document.getElementById("resident-card").classList.contains('filled') ? true : false;
        data["resident_permit"] = document.getElementById("resident-permit").classList.contains('filled') ? true : false;
        data["resident_permit_educational"] = document.getElementById("resident-permit-educational").classList.contains('filled') ? true : false;
        data["target_official"] = document.getElementById("target-official").classList.contains('filled') ? true : false;
        data["target_tourism"] = document.getElementById("target-tourism").classList.contains('filled') ? true : false;
        data["target_business"] = document.getElementById("target-business").classList.contains('filled') ? true : false;
        data["target_study"] = document.getElementById("target-study").classList.contains('filled') ? true : false;
        data["target_work"] = document.getElementById("target-work").classList.contains('filled') ? true : false;
        data["target_private"] = document.getElementById("target-private").classList.contains('filled') ? true : false;
        data["target_transit"] = document.getElementById("target-transit").classList.contains('filled') ? true : false;
        data["target_humanitarian"] = document.getElementById("target-humanitarian").classList.contains('filled') ? true : false;
        data["target_other"] = document.getElementById("target-other").classList.contains('filled') ? true : false;
        data["room_living"] = document.getElementById("room-living").classList.contains('filled') ? true : false;
        data["room_other"] = document.getElementById("room-other").classList.contains('filled') ? true : false;
        data["room_organization"] = document.getElementById("room-organization").classList.contains('filled') ? true : false;
        data["person_organization"] = document.getElementById("person-organization").classList.contains('filled') ? true : false;
        data["person_individual"] = document.getElementById("person-individual").classList.contains('filled') ? true : false;

        try {
            const response = await apiRequest(url=`/api/v1/forms/${documentId}`, options={
                method: "PUT",
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw Error("HTTP Error");
            }

            const answer = await response.json();

            hideLoadingOverlay();

            if (answer.file_name) {
                window.location.href = '/documents';
            } else {
                throw new Error('Имя файла не получено от сервера');
            }
        } catch (error) {
            hideLoadingOverlay();

            alert(`Ошибка: ${error.message}`);
            console.error('Ошибка при создании документа:', error);

            throw error;
        }
    });
    document.getElementById("update-form").style.display = "block";
});