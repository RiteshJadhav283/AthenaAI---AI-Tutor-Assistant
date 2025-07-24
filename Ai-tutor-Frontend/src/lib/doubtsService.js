import { supabase } from './supabase';

export const DoubtsService = {
  /**
   * Get all doubts history for the current user
   * @returns {Promise<Array>} Array of doubt history items
   */
  async getDoubtsHistory() {
    try {
      const { data, error } = await supabase
        .from('doubts_history')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching doubts history:', error);
      return [];
    }
  },

  /**
   * Get a specific doubt with all its messages
   * @param {string} doubtId - The ID of the doubt to fetch
   * @returns {Promise<Object>} The doubt with its messages
   */
  async getDoubtWithMessages(doubtId) {
    try {
      // Get the doubt details
      const { data: doubt, error: doubtError } = await supabase
        .from('doubts_history')
        .select('*')
        .eq('id', doubtId)
        .single();

      if (doubtError) throw doubtError;

      // Get the messages for this doubt
      const { data: messages, error: messagesError } = await supabase
        .from('doubts_messages')
        .select('*')
        .eq('doubt_id', doubtId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      return {
        ...doubt,
        messages: messages || []
      };
    } catch (error) {
      console.error('Error fetching doubt with messages:', error);
      return null;
    }
  },

  /**
   * Create a new doubt
   * @param {Object} doubt - The doubt to create
   * @param {string} doubt.title - The title of the doubt
   * @param {string} doubt.subject - The subject of the doubt
   * @param {string} doubt.preview - A preview of the doubt
   * @returns {Promise<Object>} The created doubt
   */
  async createDoubt(doubt) {
    try {
      const { data, error } = await supabase
        .from('doubts_history')
        .insert([doubt])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating doubt:', error);
      return null;
    }
  },

  /**
   * Update an existing doubt
   * @param {string} doubtId - The ID of the doubt to update
   * @param {Object} updates - The fields to update
   * @returns {Promise<Object>} The updated doubt
   */
  async updateDoubt(doubtId, updates) {
    try {
      const { data, error } = await supabase
        .from('doubts_history')
        .update(updates)
        .eq('id', doubtId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating doubt:', error);
      return null;
    }
  },

  /**
   * Add a message to a doubt
   * @param {Object} message - The message to add
   * @param {string} message.doubt_id - The ID of the doubt
   * @param {string} message.message_type - The type of message ('user' or 'ai')
   * @param {string} message.message_content - The content of the message
   * @param {string} [message.image_url] - Optional URL to an image
   * @returns {Promise<Object>} The created message
   */
  async addMessage(message) {
    try {
      const { data, error } = await supabase
        .from('doubts_messages')
        .insert([message])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding message:', error);
      return null;
    }
  },

  /**
   * Delete a doubt and all its messages
   * @param {string} doubtId - The ID of the doubt to delete
   * @returns {Promise<boolean>} Whether the deletion was successful
   */
  async deleteDoubt(doubtId) {
    try {
      // Messages will be automatically deleted due to the cascade constraint
      const { error } = await supabase
        .from('doubts_history')
        .delete()
        .eq('id', doubtId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting doubt:', error);
      return false;
    }
  },

  /**
   * Get all messages for a doubt
   * @param {string} doubtId - The ID of the doubt
   * @returns {Promise<Array>} Array of messages
   */
  async getMessages(doubtId) {
    try {
      const { data, error } = await supabase
        .from('doubts_messages')
        .select('*')
        .eq('doubt_id', doubtId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }
};