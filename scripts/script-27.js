// source: supabase-url-helper-patch
(function(){
  'use strict';
  window.__undeadSupabaseBaseUrl = function(){
    return String(window.SUPABASE_URL || "").replace(/\/rest\/v1\/?$/, "");
  };
})();
