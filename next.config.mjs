/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['avatars.githubusercontent.com'],
  },
  async redirects() {
    return [
      {
        source: '/posts/data_mart',
        destination: '/posts/data-mart',
        permanent: true,
      },
      {
        source: '/posts/data_warehouse',
        destination: '/posts/data-warehouse',
        permanent: true,
      },
      {
        source: '/posts/application_programming_interface',
        destination: '/posts/application-programming-interface',
        permanent: true,
      },
      {
        source: '/posts/confusion_matrix',
        destination: '/posts/confusion-matrix',
        permanent: true,
      },
      {
        source: '/posts/activation_function',
        destination: '/posts/activation-function',
        permanent: true,
      },
      {
        source: '/posts/loss_function',
        destination: '/posts/loss-function',
        permanent: true,
      },
      {
        source: '/posts/backward_propagation',
        destination: '/posts/backward-propagation',
        permanent: true,
      },
      {
        source: '/posts/forward_propagation',
        destination: '/posts/forward-propagation',
        permanent: true,
      },
      {
        source: '/posts/automatic_differentiation',
        destination: '/posts/automatic-differentiation',
        permanent: true,
      },
      {
        source: '/posts/large_language_models',
        destination: '/posts/large-language-models',
        permanent: true,
      },
      {
        source: '/posts/exploratory_data_analysis',
        destination: '/posts/exploratory-data-analysis',
        permanent: true,
      },
      {
        source: '/posts/convolutional_neural_network',
        destination: '/posts/convolutional-neural-network',
        permanent: true,
      },
      {
        source: '/posts/recurrent_neural_network',
        destination: '/posts/recurrent-neural-network',
        permanent: true,
      },
      {
        source: '/posts/computer_vision',
        destination: '/posts/computer-vision',
        permanent: true,
      },
      {
        source: '/posts/natural_language_processing',
        destination: '/posts/natural-language-processing',
        permanent: true,
      },
      {
        source: '/posts/artificial_intelligence',
        destination: '/posts/artificial-intelligence',
        permanent: true,
      },
      {
        source: '/posts/machine_learning',
        destination: '/posts/machine-learning',
        permanent: true,
      },
      {
        source: '/posts/neural_network',
        destination: '/posts/neural-network',
        permanent: true,
      },
      {
        source: '/posts/audio_processing',
        destination: '/posts/audio-processing',
        permanent: true,
      },
      {
        source: '/posts/data_analyst',
        destination: '/posts/data-analyst',
        permanent: true,
      },
      {
        source: '/posts/data_engineer',
        destination: '/posts/data-engineer',
        permanent: true,
      },
      {
        source: '/posts/data_scientist',
        destination: '/posts/data-scientist',
        permanent: true,
      },
      {
        source: '/posts/image_processing',
        destination: '/posts/image-processing',
        permanent: true,
      },
      {
        source: '/posts/reinforcement_learning',
        destination: '/posts/reinforcement-learning',
        permanent: true,
      },
      {
        source: '/posts/supervised_learning',
        destination: '/posts/supervised-learning',
        permanent: true,
      },
      {
        source: '/posts/unsupervised_learning',
        destination: '/posts/unsupervised-learning',
        permanent: true,
      },
      {
        source: '/posts/deep_learning',
        destination: '/posts/deep-learning',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
