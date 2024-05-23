// ==UserScript==
// @name         Hover Link Content Preview
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Preview URL content on hover over links
// @author       Fowno
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    let hoverTimeout;
    let hideTimeout;
    let previewBox;

    function createPreviewBox() {
        previewBox = document.createElement('div');
        previewBox.style.position = 'absolute';
        previewBox.style.border = '1px solid black';
        previewBox.style.backgroundColor = 'white';
        previewBox.style.padding = '10px';
        previewBox.style.zIndex = '1000';
        previewBox.style.display = 'none';
        previewBox.style.maxWidth = '300px';
        previewBox.style.maxHeight = '300px';
        previewBox.style.overflow = 'auto';
        document.body.appendChild(previewBox);

        // Prevent hiding when mouse is over the preview box
        previewBox.addEventListener('mouseover', () => {
            clearTimeout(hideTimeout);
        });

        previewBox.addEventListener('mouseout', () => {
            hidePreviewBox();
        });
    }

    function showPreviewBox(x, y, content) {
        previewBox.style.left = `${x}px`;
        previewBox.style.top = `${y}px`;
        previewBox.innerHTML = content;
        previewBox.style.display = 'block';
    }

    function hidePreviewBox() {
        if (previewBox) {
            previewBox.style.display = 'none';
        }
    }

    function extractMetaDescription(html) {
        const metaMatch = html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']\s*\/?>/i);
        if (metaMatch && metaMatch[1]) {
            return metaMatch[1];
        } else {
            return 'No description found';
        }
    }

    function fetchURLContent(url, callback) {
        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            onload: function(response) {
                if (response.status === 200) {
                    const description = extractMetaDescription(response.responseText);
                    callback(description);
                } else {
                    callback('Failed to load content');
                }
            },
            onerror: function() {
                callback('Error fetching content');
            }
        });
    }

    function onLinkHover(event) {
        const url = event.target.href;
        const x = event.clientX;
        const y = event.clientY;
        hoverTimeout = setTimeout(() => {
            fetchURLContent(url, (content) => {
                showPreviewBox(x, y + 20, content);
            });
        }, 1000);
    }

    function onLinkMouseOut() {
        clearTimeout(hoverTimeout);
        hideTimeout = setTimeout(() => {
            hidePreviewBox();
        }, 500); // Add a slight delay before hiding to allow mouse to move to the preview box
    }

    function init() {
        createPreviewBox();
        document.querySelectorAll('a').forEach(link => {
            link.addEventListener('mouseover', onLinkHover);
            link.addEventListener('mouseout', onLinkMouseOut);
        });
    }

    init();
})();
